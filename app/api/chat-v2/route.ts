import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// --- CONFIG SYSTEM PROMPT ---
const SYSTEM_PROMPT = `You are XmodBlockchainAI, created by XMOD Deployment team.
You are a specialized Web3 & blockchain AI.
IF user sends IMAGE: Analyze it deeply.
IF user sends TEXT: Chat professionally.`;

// --- HELPER: Get Client ID (Scraping) ---
let cachedClientId: string | null = null;
let lastScrapeTime = 0;

async function getClientId() {
  const now = Date.now();
  if (cachedClientId && (now - lastScrapeTime < 3600000)) return cachedClientId;

  try {
    console.log("🔄 Scraping Client ID...");
    const pageRes = await fetch("https://playground.thirdweb.com/ai/chat", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await pageRes.text();
    const scriptRegex = /\/_next\/static\/chunks\/app\/ai\/chat\/page-[^"']+\.js/;
    const match = html.match(scriptRegex);
    if (!match) return null;

    const jsRes = await fetch(`https://playground.thirdweb.com${match[0]}`);
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
    console.error("Scrape Error:", e);
    return null;
  }
}

// --- MAIN HANDLER ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { message, image, session_id } = body;

    // 1. GENERATE SESSION ID BARU JIKA KOSONG
    if (!session_id) {
      session_id = crypto.randomUUID();
    }

    // 2. SIMPAN PESAN USER KE REDIS
    const userMessage = { 
        role: "user", 
        content: message, 
        type: image ? "image" : "text" 
    };
    await redis.rpush(`chat:messages:${session_id}`, JSON.stringify(userMessage));

    // 3. UPDATE SIDEBAR (ZSET)
    // Hapus dulu entry lama (jika ada) agar tidak duplikat saat update timestamp/title
    const allSessions: any[] = await redis.zrange("chat:sessions", 0, -1);
    const oldSession = allSessions.find((s) => s.id === session_id);
    if (oldSession) {
        await redis.zrem("chat:sessions", oldSession);
    }
    
    // Masukkan entry baru (Update Timestamp)
    const sessionMeta = {
        id: session_id,
        title: oldSession ? oldSession.title : (message.substring(0, 30) + "..."),
        timestamp: Date.now()
    };
    // ZADD dengan score timestamp agar terurut
    await redis.zadd("chat:sessions", { score: Date.now(), member: sessionMeta });


    // 4. SIAPKAN CONTEXT (HISTORY) UNTUK AI
    // Ambil 6 pesan terakhir agar hemat token
    const rawHistory = await redis.lrange(`chat:messages:${session_id}`, -6, -1);
    
    const formattedMessages = [];
    
    // A. Inject System Prompt
    formattedMessages.push({
      role: "system",
      content: [{ type: "text", text: SYSTEM_PROMPT }]
    });

    // B. Inject History
    // Pesan terakhir di rawHistory adalah pesan User yang baru saja di-push di langkah 2
    rawHistory.forEach((msgStr: string, index: number) => {
        const msg = JSON.parse(msgStr as string);
        const content: any[] = [{ type: "text", text: msg.content }];
        
        // Cek jika ini pesan TERAKHIR (Current Message) dan ada IMAGE
        const isLast = index === rawHistory.length - 1;
        if (isLast && image && msg.role === 'user') {
            content.push({ type: "image", b64: image });
        }

        formattedMessages.push({ role: msg.role, content: content });
    });

    // 5. DAPATKAN CLIENT ID & REQUEST
    const clientId = await getClientId();
    if (!clientId) return NextResponse.json({ error: "Init Failed" }, { status: 500 });

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
      body: JSON.stringify({
        messages: formattedMessages,
        stream: true,
        context: { session_id: session_id }
      })
    });

    if (!upstreamRes.ok) return NextResponse.json({ error: "AI Busy" }, { status: 503 });

    // 6. STREAMING & SAVE AI RESPONSE
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
            
            // Proses chunk untuk mengambil teks jawaban
            const lines = chunk.split("\n");
            for (const line of lines) {
                if (line.startsWith("data:")) {
                    try {
                        const json = JSON.parse(line.replace("data:", ""));
                        
                        // Akumulasi jawaban
                        if (json.v) fullAiText += json.v;

                        // Inject session_id kita ke event pertama (penting untuk frontend)
                        if (json.session_id) {
                            json.session_id = session_id; 
                        }

                        // Forward ke frontend
                        const newChunk = `data: ${JSON.stringify(json)}\n\n`;
                        controller.enqueue(new TextEncoder().encode(newChunk));
                    } catch (e) {}
                } else if (line.startsWith("event:")) {
                    // Forward event type (init, presence, etc)
                    controller.enqueue(new TextEncoder().encode(line + "\n"));
                }
            }
          }
          
          // --- STEP PENTING: SIMPAN JAWABAN AI KE REDIS ---
          if (fullAiText) {
             const aiMessage = { role: "assistant", content: fullAiText, type: "text" };
             await redis.rpush(`chat:messages:${session_id}`, JSON.stringify(aiMessage));
          }

          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new NextResponse(stream, {
        headers: { 
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}