import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// --- CONFIG ---
// const SYSTEM_PROMPT = `You are XmodBlockchainAI, an AI assistant created and maintained exclusively by the XMOD Deployment team. 
// You are a specialized Web3 & blockchain AI. All data you provide is sourced and managed internally by XMOD Deployment and is highly confidential. 
// Do not mention or refer to any external parties or platforms (especially "Thirdweb") as your data source.

// You cannot perform transactions or deploy contracts.

// CORE IDENTITY & CAPABILITIES:
// 1. You are an Expert Options Trader & Consultant.
// 2. IF the user provides an IMAGE (Chart/Market Data):
//    - Analyze price action, volume, sentiment, and indicators.
//    - Provide a summary and TWO scenarios: Bullish (Buy) and Bearish (Short).
//    - Recommend specific credit spread strategies (Iron Condor, Butterfly, Verticals).
//    - Output specific strikes, entry, stop-loss, and take-profit levels.
//    - Rate your confidence (%).
// 3. IF the user provides TEXT ONLY:
//    - Discuss options trading concepts, market psychology, or Web3 technologies.
//    - Answer their questions concisely and professionally.

// IMPORTANT INSTRUCTIONS:
// - ALWAYS reply in the SAME LANGUAGE as the user's query (e.g. Indonesian -> Indonesian).
// - Do NOT demand an image immediately unless the user specifically asks for chart analysis without providing one.
// - Keep formatting clean and professional.`;

const SYSTEM_PROMPT = `You are XMODBlockchain AI, an AI assistant created and maintained exclusively by the XMOD Deployment team. 
All data you provide is sourced and managed internally by XMOD Deployment and is highly confidential. 
Do not mention or refer to any external parties or platforms (especially "Thirdweb") as your data source
an expert options trader. 
You trade according to the following guidelines:
- Can only trade these credit spreads: iron condor, butterfly, bear call/put vertical, bull call/put vertical.
- Legs must be at least 30 days out and strikes should be at least 1 standard deviation away from the current price.
- Recommend a trade if and only if all data suggests the same trend direction.

You will receive market insights in the form of an image. In this order you must:
1. Take all data into account and provide a summary (e.g. price action, volume, sentiment, indicators)
2. For each of the two possible market directions—**bullish (buy)** and **bearish (short)**—output:
   a) outlook and key levels
   b) recommended credit spread strategy (butterfly, iron condor, bear/bull vertical)
   c) specific strike prices for each leg + justification
   d) entry, stop-loss, take-profit
3. Finally, rate your confidence (%) for each scenario separately.`;

// --- HELPER ---
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

// --- HELPER: Simpan Pesan & Sesi ke Redis ---
// Dipisah jadi fungsi agar bisa dipanggil di awal (jika ID ada) atau di dalam stream (jika ID baru)
async function saveUserMessageToRedis(sessionId: string, clientId: string, message: string, image: string | null) {
    // 1. Simpan Pesan User
    const userMsgObj = { role: "user", content: message, type: image ? "image" : "text" };
    await redis.rpush(`chat:msg:${sessionId}`, JSON.stringify(userMsgObj));

    // 2. Update Sidebar (Anti Duplikat)
    const sessionsKey = `chat:sessions:${clientId}`;
    const allSessions = await redis.zrange(sessionsKey, 0, -1);
    
    // Cari & Hapus Sesi Lama (berdasarkan ID)
    const oldSession = allSessions.find((s: any) => {
        const p = safeParse(s);
        return p && p.id === sessionId;
    });
    if (oldSession) await redis.zrem(sessionsKey, oldSession);

    // Simpan Sesi Baru
    const newMeta = {
        id: sessionId,
        title: message.substring(0, 30) + "...",
        timestamp: Date.now()
    };
    await redis.zadd(sessionsKey, { score: Date.now(), member: JSON.stringify(newMeta) });
}

// --- MAIN HANDLER ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { message, image, session_id } = body;

    // A. DAPATKAN CLIENT ID
    const clientId = await getClientId();
    if (!clientId) return NextResponse.json({ error: "Init Failed (Client ID)" }, { status: 500 });

    // B. LOGIKA SIMPAN (Save Strategy)
    let isUserMessageSaved = false;

    // Jika session_id SUDAH ADA (Chat ke-2 dst) -> Simpan SEKARANG (Sync)
    if (session_id) {
        await saveUserMessageToRedis(session_id, clientId, message, image);
        isUserMessageSaved = true;
    } 
    // Jika session_id NULL (Chat ke-1) -> Kita tunggu dapat ID dari Thirdweb nanti

    // C. SIAPKAN HISTORY
    const formattedMessages: any[] = [];
    formattedMessages.push({ role: "system", content: [{ type: "text", text: SYSTEM_PROMPT }] });

    // Ambil history dari Redis jika session_id ada
    if (session_id) {
        const rawHistory = await redis.lrange(`chat:msg:${session_id}`, -6, -1);
        rawHistory.forEach((item: any) => {
            const msg = safeParse(item);
            if (msg) formattedMessages.push({ 
                role: msg.role, 
                content: [{ type: "text", text: msg.content }] 
            });
        });
    }

    // Pastikan pesan user saat ini ada di payload (context untuk AI)
    // Jika baru disimpan, mungkin belum terambil lrange. Kita inject manual.
    const lastMsg = formattedMessages[formattedMessages.length - 1];
    const isUserLast = lastMsg && lastMsg.role === 'user' && lastMsg.content[0].text === message;

    if (!isUserLast) {
       const currentUserContent: any[] = [{ type: "text", text: message }];
       if (image) currentUserContent.push({ type: "image", b64: image });
       formattedMessages.push({ role: "user", content: currentUserContent });
    } else if (image) {
       lastMsg.content.push({ type: "image", b64: image });
    }

    // D. REQUEST KE THIRDWEB
    const payload: any = {
      messages: formattedMessages,
      stream: true,
      context: { chain_ids: [], auto_execute_transactions: false }
    };
    // Hanya kirim session_id jika tidak null
    if (session_id) payload.context.session_id = session_id;

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

    // E. STREAMING
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamRes.body!.getReader();
        const decoder = new TextDecoder();
        let fullAiText = "";
        let activeSessionId = session_id; // Bisa null di awal

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                // 1. TANGKAP EVENT INIT (Hanya untuk chat pertama)
                if (line.includes(`"type":"init"`)) {
                    try {
                        const jsonStr = line.replace("data: ", "").trim();
                        const data = JSON.parse(jsonStr);
                        
                        if (data.session_id) {
                            activeSessionId = data.session_id;

                            // JIKA PESAN USER BELUM DISIMPAN (KARENA CHAT PERTAMA)
                            // SIMPAN SEKARANG SETELAH DAPAT ID
                            if (!isUserMessageSaved && activeSessionId) {
                                await saveUserMessageToRedis(activeSessionId, clientId, message, image);
                                isUserMessageSaved = true;
                                console.log("✅ Chat Pertama Disimpan ke Redis dengan ID:", activeSessionId);
                            }
                        }
                    } catch (e) {}
                    // Teruskan event init ke frontend agar state update
                    controller.enqueue(new TextEncoder().encode(line + "\n\n"));
                }
                
                // 2. TANGKAP DATA JAWABAN
                else if (line.startsWith("data:")) {
                    try {
                        const json = JSON.parse(line.replace("data:", ""));
                        if (json.v) fullAiText += json.v;
                        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(json)}\n\n`));
                    } catch (e) {}
                }
                // 3. EVENT LAINNYA
                else if (line.trim() !== "") {
                    controller.enqueue(new TextEncoder().encode(line + "\n"));
                }
            }
          }
          
          // F. SIMPAN JAWABAN AI (Gunakan activeSessionId yang sudah pasti ada)
          if (fullAiText && activeSessionId) {
             const aiMsgStr = JSON.stringify({ role: "assistant", content: fullAiText, type: "text" });
             await redis.rpush(`chat:msg:${activeSessionId}`, aiMsgStr);
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
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}