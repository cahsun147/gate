import { NextRequest, NextResponse } from 'next/server';

// --- KONFIGURASI SYSTEM PROMPT ---
const SYSTEM_PROMPT = `You are XMODBlockchain AI, an expert options trader. You trade according to the following guidelines:
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
3. Finally, rate your confidence (%) for each scenario separately.

When you reply, **format everything as a Telegram message** using _Markdown_`;

// --- LOGIC SCRAPING CLIENT ID (Dynamic) ---
let cachedClientId: string | null = null;
let lastScrapeTime = 0;

async function getClientId() {
  const now = Date.now();
  // Cache valid selama 1 jam
  if (cachedClientId && (now - lastScrapeTime < 3600000)) {
    return cachedClientId;
  }

  try {
    console.log("🔄 Scraping new Client ID...");
    const pageRes = await fetch("https://playground.thirdweb.com/ai/chat", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const html = await pageRes.text();
    
    // 1. Cari path file JS (FIX: Tambahkan \/ di awal regex)
    // Regex ini sekarang mencari string yang dimulai dengan "/_next"
    const scriptRegex = /\/_next\/static\/chunks\/app\/ai\/chat\/page-[^"']+\.js/;
    
    const match = html.match(scriptRegex);
    if (!match) throw new Error("JS File not found in HTML");

    // match[0] sekarang berisi "/_next/...", jadi URL-nya valid
    const jsUrl = `https://playground.thirdweb.com${match[0]}`;
    console.log("🔍 Fetching JS:", jsUrl);

    // 2. Fetch file JS
    const jsRes = await fetch(jsUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const jsContent = await jsRes.text();

    // 3. Extract Client ID
    let idMatch = jsContent.match(/"x-client-id"\s*:\s*"([a-f0-9]{32})"/);
    if (!idMatch) {
        idMatch = jsContent.match(/clientId\s*:\s*"([a-f0-9]{32})"/);
    }

    if (idMatch && idMatch[1]) {
        cachedClientId = idMatch[1];
        lastScrapeTime = now;
        console.log("✅ Client ID obtained:", cachedClientId);
        return cachedClientId;
    }
    
    return null;
  } catch (e) {
    console.error("❌ Failed to scrape Client ID:", e);
    return null;
  }
}

// --- API HANDLER ---
export async function POST(req: NextRequest) {
  try {
    // 1. Parse Input
    const body = await req.json();
    const { message, image, session_id } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 2. Dapatkan Client ID
    const clientId = await getClientId();
    if (!clientId) {
      return NextResponse.json({ error: "Failed to initialize AI Service" }, { status: 500 });
    }

    // 3. Susun Pesan
    const messages = [
      {
        role: "system",
        content: [{ type: "text", text: SYSTEM_PROMPT }]
      }
    ];

    const userContent: any[] = [
      { type: "text", text: `User Query: ${message}` }
    ];

    if (image) {
      userContent.push({
        type: "image",
        b64: image
      });
    }

    messages.push({
      role: "user",
      content: userContent
    });

    // 4. Susun Payload
    const payload = {
      messages: messages,
      stream: true,
      context: {
        chain_ids: [],
        auto_execute_transactions: false,
        session_id: session_id || undefined
      }
    };

    // 5. Request ke Thirdweb
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
      return NextResponse.json({ error: "AI Service Busy" }, { status: 503 });
    }

    if (!upstreamRes.body) {
      return NextResponse.json({ error: "No response body" }, { status: 500 });
    }

    // 6. STREAMING RESPONSE (Pass-through raw stream)
    // Langsung meneruskan stream dari Thirdweb ke Client (User)
    // Termasuk event 'presence', 'init', 'delta' dsb.
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