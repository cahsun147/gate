import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// --- CONFIG SYSTEM PROMPT ---
const SYSTEM_PROMPT = `You are XmodBlockchainAI, created by XMOD Deployment team.
You are a specialized Web3 & blockchain AI.
IF user sends IMAGE: Analyze it deeply.
IF user sends TEXT: Chat professionally.`;

// --- HELPER: Safe JSON Parse ---
function safeParse(data: any) {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return null; }
  }
  return data;
}

// --- HELPER: Get Client ID (Scraping) ---
let cachedClientId: string | null = null;
let lastScrapeTime = 0;

async function getClientId() {
  const now = Date.now();
  if (cachedClientId && (now - lastScrapeTime < 3600000)) {
    return cachedClientId;
  }

  try {
    console.log("🔄 [V2] Scraping Client ID...");
    
    // 1. Fetch HTML Halaman Utama
    const pageRes = await fetch("https://playground.thirdweb.com/ai/chat", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    
    if (!pageRes.ok) throw new Error(`Page fetch failed: ${pageRes.status}`);
    const html = await pageRes.text();
    
    // 2. Cari path file JS
    const scriptRegex = /\/_next\/static\/chunks\/app\/ai\/chat\/page-[^"']+\.js/;
    const match = html.match(scriptRegex);
    if (!match) throw new Error("JS File not found in HTML");

    const jsUrl = `https://playground.thirdweb.com${match[0]}`;

    // 3. Fetch File JS (FIX: WAJIB ADA USER-AGENT)
    const jsRes = await fetch(jsUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    if (!jsRes.ok) throw new Error(`JS fetch failed: ${jsRes.status}`);
    const jsContent = await jsRes.text();

    // 4. Extract ID
    let idMatch = jsContent.match(/"x-client-id"\s*:\s*"([a-f0-9]{32})"/);
    if (!idMatch) {
        idMatch = jsContent.match(/clientId\s*:\s*"([a-f0-9]{32})"/);
    }

    if (idMatch && idMatch[1]) {
      cachedClientId = idMatch[1];
      lastScrapeTime = now;
      console.log("✅ [V2] Client ID Obtained:", cachedClientId);
      return cachedClientId;
    }
    
    throw new Error("Client ID regex match failed");
  } catch (e) {
    console.error("❌ [V2] Scraping Error:", e);
    return null;
  }
}

// --- MAIN HANDLER ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { message, image, session_id } = body;

    // 1. Validasi & Init Session
    if (!session_id) {
        session_id = Date.now().toString(36);
    }

    console.log(`📩 [V2] New Message for Session: ${session_id}`);

    // 2. Simpan Pesan User ke Redis
    const userMessage = { 
        role: "user", 
        content: message, 
        type: image ? "image" : "text" 
    };
    await redis.rpush(`chat:messages:${session_id}`, JSON.stringify(userMessage));

    // 3. Update Sidebar (Optimized)
    const sessionMeta = {
        id: session_id,
        title: message.substring(0, 30) + "...",
        timestamp: Date.now()
    };
    
    // Update ZSET (Hapus lama jika ada, masukkan baru)
    const allSessions = await redis.zrange("chat:sessions", 0, -1);
    const existing = allSessions.find((s: any) => {
        const p = safeParse(s);
        return p && p.id === session_id;
    });
    if (existing) await redis.zrem("chat:sessions", existing);
    await redis.zadd("chat:sessions", { score: Date.now(), member: JSON.stringify(sessionMeta) });


    // 4. Siapkan Context (History)
    const rawHistory = await redis.lrange(`chat:messages:${session_id}`, -6, -1);
    const formattedMessages = [];
    
    // A. System Prompt
    formattedMessages.push({
      role: "system",
      content: [{ type: "text", text: SYSTEM_PROMPT }]
    });

    // B. History Chat
    rawHistory.forEach((item: any, index: number) => {
        const msg = safeParse(item);
        if (!msg) return;

        const content: any[] = [{ type: "text", text: msg.content }];
        
        // Inject Image ke pesan terakhir jika ada
        const isLast = index === rawHistory.length - 1;
        if (isLast && image && msg.role === 'user') {
            content.push({ type: "image", b64: image });
        }

        formattedMessages.push({ role: msg.role, content: content });
    });

    // 5. Dapatkan Client ID
    const clientId = await getClientId();
    if (!clientId) {
        return NextResponse.json({ error: "Server Failed to Connect to AI (Scraping Error)" }, { status: 500 });
    }

    // 6. Request ke Thirdweb
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

    if (!upstreamRes.ok) {
        const errText = await upstreamRes.text();
        console.error(`❌ [V2] Thirdweb Error ${upstreamRes.status}:`, errText);
        return NextResponse.json({ error: "AI Service Busy/Error", details: errText }, { status: 503 });
    }

    // 7. Streaming Response
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
                if (line.startsWith("data:")) {
                    try {
                        const json = JSON.parse(line.replace("data:", ""));
                        if (json.v) fullAiText += json.v;
                        if (json.session_id) json.session_id = session_id; 
                        
                        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(json)}\n\n`));
                    } catch (e) {}
                } else if (line.startsWith("event:")) {
                    controller.enqueue(new TextEncoder().encode(line + "\n"));
                }
            }
          }
          
          // 8. SIMPAN JAWABAN AI KE REDIS
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

  } catch (error: any) {
    console.error("🔥 [V2] Critical Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}