import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const SYSTEM_PROMPT = `You are XmodBlockchainAI, created by XMOD Deployment team.
You are a specialized Web3 & blockchain AI.
IF user sends IMAGE: Analyze it deeply.
IF user sends TEXT: Chat professionally.`;

function safeParse(data: any) {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return null; }
  }
  return data;
}

let cachedClientId: string | null = null;
let lastScrapeTime = 0;

async function getClientId() {
  const now = Date.now();
  if (cachedClientId && (now - lastScrapeTime < 3600000)) return cachedClientId;

  try {
    console.log("🔄 Scraping Client ID...");
    const pageRes = await fetch("https://playground.thirdweb.com/ai/chat", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const html = await pageRes.text();
    const match = html.match(/\/_next\/static\/chunks\/app\/ai\/chat\/page-[^"']+\.js/);
    if (!match) throw new Error("JS Path not found");

    const jsUrl = `https://playground.thirdweb.com${match[0]}`;
    const jsRes = await fetch(jsUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const jsContent = await jsRes.text();

    let idMatch = jsContent.match(/"x-client-id"\s*:\s*"([a-f0-9]{32})"/);
    if (!idMatch) idMatch = jsContent.match(/clientId\s*:\s*"([a-f0-9]{32})"/);

    if (idMatch && idMatch[1]) {
      cachedClientId = idMatch[1];
      lastScrapeTime = now;
      return cachedClientId;
    }
    return null;
  } catch (e) {
    console.error("❌ Scraping Error:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { message, image, session_id } = body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!session_id || !uuidRegex.test(session_id)) {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            session_id = crypto.randomUUID();
        } else {
            session_id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        }
    }

    const clientId = await getClientId();
    if (!clientId) return NextResponse.json({ error: "Init Failed (Client ID)" }, { status: 500 });

    const userMsgObj = { role: "user", content: message, type: image ? "image" : "text" };
    await redis.rpush(`chat:msg:${session_id}`, JSON.stringify(userMsgObj));

    const sessionsKey = `chat:sessions:${clientId}`;
    
    const allSessions = await redis.zrange(sessionsKey, 0, -1);
    const oldSession = allSessions.find((s: any) => {
        const p = safeParse(s);
        return p && p.id === session_id;
    });
    if (oldSession) await redis.zrem(sessionsKey, oldSession);

    const newMeta = {
        id: session_id,
        title: message.substring(0, 30) + "...",
        timestamp: Date.now()
    };
    await redis.zadd(sessionsKey, { score: Date.now(), member: JSON.stringify(newMeta) });

    const formattedMessages: any[] = [];
    formattedMessages.push({ role: "system", content: [{ type: "text", text: SYSTEM_PROMPT }] });

    const rawHistory = await redis.lrange(`chat:msg:${session_id}`, -6, -1);
    rawHistory.forEach((item: any) => {
        const msg = safeParse(item);
        if (msg) formattedMessages.push({ 
            role: msg.role, 
            content: [{ type: "text", text: msg.content }] 
        });
    });

    const lastMsg = formattedMessages[formattedMessages.length - 1];
    const isUserLast = lastMsg && lastMsg.role === 'user' && lastMsg.content[0].text === message;

    if (!isUserLast) {
       const currentUserContent: any[] = [{ type: "text", text: message }];
       if (image) currentUserContent.push({ type: "image", b64: image });
       formattedMessages.push({ role: "user", content: currentUserContent });
    } else if (image) {
       lastMsg.content.push({ type: "image", b64: image });
    }

    const payload: any = {
      messages: formattedMessages,
      stream: true,
      context: { chain_ids: [], auto_execute_transactions: false, session_id: session_id }
    };

    const upstreamRes = await fetch("https://api.thirdweb.com/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "Origin": "https://playground.thirdweb.com",
        "Referer": "https://playground.thirdweb.com/",
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/event-stream"
      },
      body: JSON.stringify(payload)
    });

    if (!upstreamRes.ok) {
        const errText = await upstreamRes.text();
        return NextResponse.json({ error: "AI Busy", details: errText }, { status: 503 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamRes.body!.getReader();
        const decoder = new TextDecoder();
        let fullAiText = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.trim() !== "") {
                    controller.enqueue(new TextEncoder().encode(line + "\n"));
                }

                if (line.startsWith("data:")) {
                    try {
                        const json = JSON.parse(line.replace("data:", ""));
                        if (json.v) fullAiText += json.v;
                    } catch (e) {}
                }
            }
          }
          
          if (fullAiText) {
             const aiMsgStr = JSON.stringify({ role: "assistant", content: fullAiText, type: "text" });
             await redis.rpush(`chat:msg:${session_id}`, aiMsgStr);
          }

          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new NextResponse(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }
    });

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}