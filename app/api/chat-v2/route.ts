import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// --- CONFIG ---
const SYSTEM_PROMPT = `You are XmodBlockchainAI, created by XMOD Deployment team.
You are a specialized Web3 & blockchain AI.
IF user sends IMAGE: Analyze it deeply.
IF user sends TEXT: Chat professionally.`;

// --- HELPER: Safe Parse JSON ---
function safeParse(data: any) {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return null; }
  }
  return data;
}

// --- HELPER: Get Client ID (V1 Logic - Stabil) ---
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

    // 1. SIAPKAN CONTEXT (History)
    // Jika session_id ada (chat kedua dst), ambil history dari Redis
    const formattedMessages = [];
    formattedMessages.push({ role: "system", content: [{ type: "text", text: SYSTEM_PROMPT }] });

    if (session_id) {
        // Ambil history dari list context utama
        const rawHistory = await redis.lrange(`chat:history:${session_id}`, -6, -1);
        rawHistory.forEach((item: any) => {
            const msg = safeParse(item);
            if (msg) formattedMessages.push({ 
                role: msg.role, 
                content: [{ type: "text", text: msg.content }] 
            });
        });
    }

    // Tambahkan pesan user saat ini ke payload Thirdweb
    const currentUserContent: any[] = [{ type: "text", text: message }];
    if (image) currentUserContent.push({ type: "image", b64: image });
    formattedMessages.push({ role: "user", content: currentUserContent });

    // 2. DAPATKAN CLIENT ID
    const clientId = await getClientId();
    if (!clientId) return NextResponse.json({ error: "Init Failed" }, { status: 500 });

    // 3. REQUEST KE THIRDWEB (Tanpa maksa session_id jika null)
    const payload: any = {
      messages: formattedMessages,
      stream: true,
      context: { chain_ids: [], auto_execute_transactions: false }
    };
    
    // Hanya kirim session_id jika sudah ada (Chat ke-2++)
    if (session_id) {
        payload.context.session_id = session_id;
    }

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

    // 4. STREAMING & CAPTURE ID
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamRes.body!.getReader();
        const decoder = new TextDecoder();
        
        let fullAiText = "";
        let activeSessionId = session_id; // Bisa null di awal
        let activeRequestId = null;
        let isFirstInit = true;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                // A. DETEKSI EVENT INIT (Dapat ID dari Thirdweb)
                if (line.includes(`"type":"init"`)) {
                    try {
                        // Parse JSON dari baris data: {...}
                        const jsonStr = line.replace("data: ", "").trim();
                        const data = JSON.parse(jsonStr);
                        
                        if (data.session_id) {
                            activeSessionId = data.session_id;
                            activeRequestId = data.request_id;

                            // --- TRIGGER SIMPAN KE REDIS (Saat ID ditemukan) ---
                            if (isFirstInit) {
                                console.log(`✅ [V2] Got ID: ${activeSessionId} | Req: ${activeRequestId}`);
                                
                                // 1. Simpan Client ID Mapping (Sesuai request Anda)
                                await redis.set(`chat:client-id:${clientId}`, activeSessionId);

                                // 2. Simpan Pesan User (Sekarang kita punya ID-nya)
                                const userMsgObj = { role: "user", content: message, type: image ? "image" : "text" };
                                const userMsgStr = JSON.stringify(userMsgObj);
                                
                                // A: Simpan ke Log Request Spesifik (Sesuai request Anda)
                                await redis.set(`chat:msg:${activeSessionId}:${activeRequestId}`, userMsgStr);
                                
                                // B: Simpan ke History List (Wajib untuk context chat berikutnya)
                                await redis.rpush(`chat:history:${activeSessionId}`, userMsgStr);
                                
                                // C: Update Sidebar
                                const sessionMeta = {
                                    id: activeSessionId,
                                    title: message.substring(0, 30) + "...",
                                    timestamp: Date.now()
                                };
                                await redis.zadd("chat:sessions", { score: Date.now(), member: JSON.stringify(sessionMeta) });

                                isFirstInit = false;
                            }
                        }
                        
                        // Teruskan event init ke frontend agar state frontend update
                        controller.enqueue(new TextEncoder().encode(line + "\n\n"));
                    } catch (e) { console.error("Parse Init Error", e); }
                } 
                // B. DETEKSI JAWABAN (Delta)
                else if (line.startsWith("data:")) {
                    try {
                        const json = JSON.parse(line.replace("data:", ""));
                        if (json.v) fullAiText += json.v;
                        controller.enqueue(new TextEncoder().encode(line + "\n\n")); // Teruskan ke frontend
                    } catch (e) {}
                } 
                // C. EVENT LAIN (Presence, etc)
                else if (line.trim() !== "") {
                    controller.enqueue(new TextEncoder().encode(line + "\n"));
                }
            }
          }
          
          // 5. SETELAH STREAM SELESAI: Simpan Jawaban AI
          if (fullAiText && activeSessionId) {
             const aiMsgObj = { role: "assistant", content: fullAiText, type: "text" };
             const aiMsgStr = JSON.stringify(aiMsgObj);
             
             // Simpan ke History List (untuk context)
             await redis.rpush(`chat:history:${activeSessionId}`, aiMsgStr);
             
             // Opsional: Simpan ke Log Request juga jika perlu
             // await redis.append(`chat:msg:${activeSessionId}:${activeRequestId}`, " | AI: " + fullAiText);
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
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Error", details: error.message }, { status: 500 });
  }
}