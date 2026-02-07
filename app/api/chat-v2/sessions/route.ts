import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { PrivyClient } from '@privy-io/server-auth';

// 1. Setup Privy Client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

// 2. Helper Safe Parse
function safeParse(data: any) {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return null; }
  }
  return data;
}

// 3. Helper Client ID (Tetap ada untuk keperluan gambar di Frontend)
let cachedClientId: string | null = null;
let lastScrapeTime = 0;

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

// --- GET HANDLER (Load History) ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    // A. CEK TOKEN (Wajib Login)
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // Jika tidak ada token, kembalikan kosong (Bukan error, biar UI aman)
    if (!token) {
        return NextResponse.json([], { status: 200 });
    }

    const claims = await privy.verifyAuthToken(token);
    const userId = claims.userId;

    // B. LOGIKA PENGAMBILAN DATA (User Scope)
    
    // SKENARIO 1: DETAIL CHAT (Klik salah satu history)
    if (id) {
        // Ambil dari LIST user
        const chatKey = `user:${userId}:chat:${id}`;
        const rawMessages = await redis.lrange(chatKey, 0, -1);
        const messages = rawMessages.map(safeParse).filter(Boolean);
        return NextResponse.json({ messages });
    }

    // SKENARIO 2: SIDEBAR LIST (Load awal)
    // Ambil dari ZSET user
    const sessionsKey = `user:${userId}:sessions`;
    const rawSessions = await redis.zrange(sessionsKey, 0, -1, { rev: true });
    
    const sessions = rawSessions.map((s: any) => {
        const obj = safeParse(s);
        // Pastikan return object memiliki clientId untuk gambar IPFS
        return obj ? { 
            id: obj.id, 
            title: obj.title, 
            timestamp: obj.timestamp,
            clientId: obj.clientId // Frontend butuh ini
        } : null;
    }).filter(Boolean);

    // Ambil ClientID global buat jaga-jaga (dikirim di header)
    const globalClientId = await getClientId();
    
    const response = NextResponse.json(sessions);
    if (globalClientId) {
        response.headers.set('x-thirdweb-client-id', globalClientId);
    }
    
    return response;

  } catch (error) {
    console.error("Session Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// --- DELETE HANDLER (Hapus History) ---
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    // A. CEK TOKEN
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const claims = await privy.verifyAuthToken(token);
    const userId = claims.userId;

    // B. HAPUS DATA (Hanya jika milik user tersebut)
    const sessionsKey = `user:${userId}:sessions`;
    const chatKey = `user:${userId}:chat:${id}`;

    // Cari member spesifik di ZSET untuk dihapus (butuh string exact)
    const allSessions = await redis.zrange(sessionsKey, 0, -1);
    const sessionToDelete = allSessions.find((s: any) => {
        const obj = safeParse(s);
        return obj && obj.id === id;
    });

    if (sessionToDelete) {
        await redis.zrem(sessionsKey, sessionToDelete as string); // Hapus dari sidebar
        await redis.del(chatKey); // Hapus isi chat
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}