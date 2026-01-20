import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// --- CONFIG SYSTEM PROMPT ---
const SYSTEM_PROMPT = `You are XmodBlockchainAI, created by XMOD Deployment team.
You are a specialized Web3 & blockchain AI.
IF user sends IMAGE: Analyze it deeply.
IF user sends TEXT: Chat professionally.`;

// --- HELPER: Simple ID Generator (Polyfill for crypto.randomUUID) ---
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// --- HELPER: Safe JSON Parse ---
// Menangani kasus apakah data dari Redis berupa String atau sudah Object
function safeParse(data: any) {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return null; }
  }
  return data; // Sudah object
}

// --- HELPER: Get Client ID (Scraping) ---
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

    // 1. GENERATE SESSION ID (Safe Version)
    if (!session_id) {
      session_id = generateId();
    }

    // 2. SIMPAN PESAN USER KE REDIS
    const userMessage = { 
        role: "user", 
        content: message, 
        type: image ? "image" : "text" 
    };
    // Kita stringify manual agar konsisten
    await redis.rpush(`chat:messages:${session_id}`, JSON.stringify(userMessage));

    // 3. UPDATE SIDEBAR (ZSET)
    // Ambil semua sesi untuk cek duplikat (Safe Parsing)
    const rawSessions = await redis.zrange("chat:sessions", 0, -1);
    
    // Cari sesi lama (parse dulu sebelum cek ID)
    const oldSessionMember = rawSessions.find((s: any) => {
        const parsed = safeParse(s);
        return parsed && parsed.id === session_id;
    });

    // Hapus sesi lama jika ada (untuk update timestamp)
    if (oldSessionMember) {
        await redis.zrem("chat:sessions", oldSessionMember);
    }
    
    // Tambahkan sesi baru
    const sessionMeta = {
        id: session_id,
        title: oldSessionMember ? safeParse(oldSessionMember).title : (message.substring(0, 30) + "..."),
        timestamp: Date.now()
    };
    await redis.zadd("chat:sessions", { score: Date.now(), member: sessionMeta });


    // 4. SIAPKAN CONTEXT (HISTORY)
    const rawHistory = await redis.lrange(`chat:messages:${session_id}`, -6, -1);
    
    const formattedMessages = [];
    
    // Inject System Prompt
    formattedMessages.push({
      role: "system",
      content: [{ type: "text", text: SYSTEM_PROMPT }]
    });

    // Process History (SAFE PARSING)
    rawHistory.forEach((item: any, index: number) => {
        const msg = safeParse(item);
        if (!msg) return; // Skip jika corrupt

        const content: any[] = [{ type: "text", text: msg.content }];
        
        // Cek pesan terakhir & gambar
        const isLast = index === rawHistory.length - 1;
        if (isLast && image && msg.role === 'user') {
            content.push({ type: "image", b64: image });
        }

        formattedMessages.push({ role: msg.role, content: content });
    });

    // 5. DAPATKAN CLIENT ID
    const clientId = await getClientId();
    if (!clientId) {
        // Return pesan error spesifik jika scraping gagal
        return NextResponse.json({ error: "Failed to init AI (Scraping Error)" }, { status: 500 });
    }

    // 6. REQUEST KE THIRDWEB
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
        return NextResponse.json({ error: `AI Service Error: ${upstreamRes.status}`, details: errText }, { status: 503 });
    }

    // 7. STREAMING
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
            
            // Pass-through chunk ke frontend
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
          
          // SAVE AI RESPONSE KE REDIS
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
    console.error("API Error:", error);
    // PENTING: Kembalikan pesan error asli agar terbaca di frontend
    return NextResponse.json({ 
        error: "Server Error", 
        details: error.message || String(error) 
    }, { status: 500 });
  }
}