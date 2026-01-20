import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// Helper sama
function safeParse(data: any) {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return null; }
  }
  return data;
}

let cachedClientId: string | null = null;
let lastScrapeTime = 0;

// Kita butuh Client ID untuk tahu key mana yang harus dibaca (chat:sessions:{clientId})
async function getClientId() {
  const now = Date.now();
  if (cachedClientId && (now - lastScrapeTime < 3600000)) return cachedClientId;
  try {
    const pageRes = await fetch("https://playground.thirdweb.com/ai/chat", { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await pageRes.text();
    const match = html.match(/\/_next\/static\/chunks\/app\/ai\/chat\/page-[^"']+\.js/);
    if (!match) return null;
    const jsRes = await fetch(`https://playground.thirdweb.com${match[0]}`, { headers: { "User-Agent": "Mozilla/5.0" } });
    const jsContent = await jsRes.text();
    let idMatch = jsContent.match(/"x-client-id"\s*:\s*"([a-f0-9]{32})"/);
    if (!idMatch) idMatch = jsContent.match(/clientId\s*:\s*"([a-f0-9]{32})"/);
    if (idMatch && idMatch[1]) {
      cachedClientId = idMatch[1];
      lastScrapeTime = now;
      return cachedClientId;
    }
    return null;
  } catch (e) { return null; }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    // 1. DETAIL CHAT (Isi Pesan)
    // Key harus konsisten dengan route.ts -> chat:msg:{id}
    if (id) {
      const rawMessages = await redis.lrange(`chat:msg:${id}`, 0, -1);
      const messages = rawMessages.map(safeParse).filter(Boolean);
      return NextResponse.json({ messages });
    }

    // 2. LIST SIDEBAR
    // Key harus konsisten dengan route.ts -> chat:sessions:{clientId}
    const clientId = await getClientId();
    if (!clientId) return NextResponse.json([], { status: 500 }); 

    const sessionsKey = `chat:sessions:${clientId}`;
    const rawSessions = await redis.zrange(sessionsKey, 0, -1, { rev: true });
    
    const sessions = rawSessions.map((s: any) => {
        const obj = safeParse(s);
        // Frontend mengharapkan { id, title, timestamp }
        return obj ? { id: obj.id, title: obj.title, timestamp: obj.timestamp } : null;
    }).filter(Boolean);

    return NextResponse.json(sessions);

  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    // Hapus Isi Pesan
    await redis.del(`chat:msg:${id}`);
    
    // Hapus dari List Sidebar
    const clientId = await getClientId();
    if (clientId) {
        const sessionsKey = `chat:sessions:${clientId}`;
        const allSessions = await redis.zrange(sessionsKey, 0, -1);
        const sessionToDelete = allSessions.find((s: any) => {
            const obj = safeParse(s);
            return obj && obj.id === id;
        });
        if (sessionToDelete) await redis.zrem(sessionsKey, sessionToDelete);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}