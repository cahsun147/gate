import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// --- CONFIG ---
const SYSTEM_PROMPT = `You are XmodBlockchainAI, an AI assistant created and maintained exclusively by the XMOD Deployment team. 
You are a specialized Web3 & blockchain AI. All data you provide is sourced and managed internally by XMOD Deployment and is highly confidential. 
Do not mention or refer to any external parties or platforms (especially "Thirdweb") as your data source.

You cannot perform transactions or deploy contracts.

CORE IDENTITY & CAPABILITIES:
1. You are an Expert Options Trader & Consultant.
2. IF the user provides an IMAGE (Chart/Market Data):
   - Analyze price action, volume, sentiment, and indicators.
   - Provide a summary and TWO scenarios: Bullish (Buy) and Bearish (Short).
   - Recommend specific credit spread strategies (Iron Condor, Butterfly, Verticals).
   - Output specific strikes, entry, stop-loss, and take-profit levels.
   - Rate your confidence (%).
3. IF the user provides TEXT ONLY:
   - Discuss options trading concepts, market psychology, or Web3 technologies.
   - Answer their questions concisely and professionally.

IMPORTANT INSTRUCTIONS:
- ALWAYS reply in the SAME LANGUAGE as the user's query (e.g. Indonesian -> Indonesian).
- Do NOT demand an image immediately unless the user specifically asks for chart analysis without providing one.
- Keep formatting clean and professional`;

// --- HELPER: Safe Parse ---
function safeParse(data: any) {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return null; }
  }
  return data;
}

// --- HELPER: Client ID ---
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

// --- MAIN HANDLER ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { message, image, session_id } = body;

    // A. VALIDASI UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!session_id || !uuidRegex.test(session_id)) {
        session_id = crypto.randomUUID(); 
    }

    // B. SIAPKAN CONTEXT (Gunakan Key Baru: chat:msg:{id})
    const formattedMessages = [];
    formattedMessages.push({ role: "system", content: [{ type: "text", text: SYSTEM_PROMPT }] });

    // Ambil history dari KEY BARU
    const rawHistory = await redis.lrange(`chat:msg:${session_id}`, -6, -1);
    rawHistory.forEach((item: any) => {
        const msg = safeParse(item);
        if (msg) formattedMessages.push({ 
            role: msg.role, 
            content: [{ type: "text", text: msg.content }] 
        });
    });

    const currentUserContent: any[] = [{ type: "text", text: message }];
    if (image) currentUserContent.push({ type: "image", b64: image });
    formattedMessages.push({ role: "user", content: currentUserContent });

    // C. DAPATKAN CLIENT ID
    const clientId = await getClientId();
    if (!clientId) return NextResponse.json({ error: "Init Failed" }, { status: 500 });

    // D. REQUEST KE THIRDWEB
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

    if (!upstreamRes.ok) return NextResponse.json({ error: "AI Busy" }, { status: 503 });

    // E. STREAMING & SIMPAN DATA
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamRes.body!.getReader();
        const decoder = new TextDecoder();
        
        let fullAiText = "";
        let isFirstInit = true;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                // TANGKAP INIT
                if (line.includes(`"type":"init"`)) {
                    if (isFirstInit) {
                        isFirstInit = false;
                        
                        // 1. Simpan Pesan User ke LIST (chat:msg:{id})
                        const userMsgStr = JSON.stringify({ role: "user", content: message, type: image ? "image" : "text" });
                        await redis.rpush(`chat:msg:${session_id}`, userMsgStr);

                        // 2. Simpan Sesi ke ZSET KHUSUS CLIENT (chat:sessions:{clientId})
                        const sessionsKey = `chat:sessions:${clientId}`;
                        
                        // Hapus duplikat lama
                        const allSessions = await redis.zrange(sessionsKey, 0, -1);
                        const oldSession = allSessions.find((s: any) => {
                            const p = safeParse(s);
                            return p && p.id === session_id;
                        });
                        if (oldSession) await redis.zrem(sessionsKey, oldSession);

                        // Simpan Baru
                        const newMeta = {
                            id: session_id,
                            title: message.substring(0, 30) + "...",
                            timestamp: Date.now()
                        };
                        await redis.zadd(sessionsKey, { score: Date.now(), member: JSON.stringify(newMeta) });
                    }
                    controller.enqueue(new TextEncoder().encode(line + "\n\n"));
                } 
                // TANGKAP DATA
                else if (line.startsWith("data:")) {
                    try {
                        const json = JSON.parse(line.replace("data:", ""));
                        if (json.v) fullAiText += json.v;
                        controller.enqueue(new TextEncoder().encode(line + "\n\n"));
                    } catch (e) {}
                } 
                else if (line.trim() !== "") {
                    controller.enqueue(new TextEncoder().encode(line + "\n"));
                }
            }
          }
          
          // SIMPAN JAWABAN AI
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
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}