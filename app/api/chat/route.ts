import { NextRequest, NextResponse } from 'next/server';

// --- 1. UNIFIED SYSTEM PROMPT (IDENTITAS & ATURAN) ---
// Kita gabungkan instruksi Identitas, Trading Expert, dan Assistant menjadi satu.
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
- Keep formatting clean and professional.`;


// --- 2. LOGIC SCRAPING CLIENT ID (Dynamic) ---
let cachedClientId: string | null = null;
let lastScrapeTime = 0;

async function getClientId() {
  const now = Date.now();
  if (cachedClientId && (now - lastScrapeTime < 3600000)) {
    return cachedClientId;
  }

  try {
    console.log("🔄 Scraping new Client ID...");
    const pageRes = await fetch("https://playground.thirdweb.com/ai/chat", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const html = await pageRes.text();
    
    const scriptRegex = /\/_next\/static\/chunks\/app\/ai\/chat\/page-[^"']+\.js/;
    const match = html.match(scriptRegex);
    if (!match) throw new Error("JS File not found in HTML");

    const jsUrl = `https://playground.thirdweb.com${match[0]}`;
    const jsRes = await fetch(jsUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const jsContent = await jsRes.text();

    let idMatch = jsContent.match(/"x-client-id"\s*:\s*"([a-f0-9]{32})"/);
    if (!idMatch) {
        idMatch = jsContent.match(/clientId\s*:\s*"([a-f0-9]{32})"/);
    }

    if (idMatch && idMatch[1]) {
        cachedClientId = idMatch[1];
        lastScrapeTime = now;
        return cachedClientId;
    }
    return null;
  } catch (e) {
    console.error("❌ Failed to scrape Client ID:", e);
    return null;
  }
}

// --- 3. API HANDLER ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Frontend mengirim 'messages' (array history) dan 'image' (opsional string base64)
    const { messages, image, session_id } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Ambil pesan terakhir user untuk ditempelkan gambar (jika ada)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
       return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
    }

    const clientId = await getClientId();
    if (!clientId) {
      return NextResponse.json({ error: "Failed to initialize AI Service" }, { status: 500 });
    }

    // --- PREPARE PAYLOAD ---
    const formattedMessages = [];

    // A. INJECT SYSTEM PROMPT (Identitas) - Selalu di urutan pertama
    formattedMessages.push({
      role: "system",
      content: [{ type: "text", text: SYSTEM_PROMPT }]
    });

    // B. PROSES HISTORY CHAT DARI FRONTEND
    for (const msg of messages) {
      // Cek apakah ini pesan terakhir DAN ada gambar yang dikirim user?
      if (msg === lastMessage && msg.role === 'user') {
        const content: any[] = [{ type: "text", text: msg.content }];
        
        // Jika ada image dari frontend, tempelkan ke pesan terakhir ini
        if (image) {
          content.push({ type: "image", b64: image });
        }
        
        formattedMessages.push({ role: "user", content: content });
      } 
      else {
        // History chat biasa (text only)
        // Kita konversi string frontend -> array content Thirdweb
        formattedMessages.push({
          role: msg.role,
          content: [{ type: "text", text: msg.content }] 
        });
      }
    }

    // --- REQUEST KE THIRDWEB ---
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
        context: {
          chain_ids: [],
          auto_execute_transactions: false,
          session_id: session_id || undefined
        }
      })
    });

    if (!upstreamRes.ok) {
      return NextResponse.json({ error: "AI Service Busy" }, { status: 503 });
    }
    if (!upstreamRes.body) {
      return NextResponse.json({ error: "No response body" }, { status: 500 });
    }

    // --- STREAMING RESPONSE ---
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamRes.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
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
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}