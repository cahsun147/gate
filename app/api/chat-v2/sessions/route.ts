import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { PrivyClient } from '@privy-io/server-auth';

// 1. Setup Privy Client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

// 2. Helper Safe Parse (Wajib untuk parsing data Redis)
function safeParse(data: any) {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return null; }
  }
  return data;
}

// 3. Helper Client ID (Opsional: Jika kita ingin kirim ID terbaru di header sebagai cadangan)
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

// --- GET HANDLER (Ambil List Sesi & Detail Chat) ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    // A. VERIFIKASI USER (Wajib Login)
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // Jika tidak ada token, kembalikan list kosong (jangan error 500, biar UI tetap render)
    if (!token) {
        return NextResponse.json([], { status: 200 });
    }

    const claims = await privy.verifyAuthToken(token);
    const userId = claims.userId;

    // B. DEFINISI KEY (Sesuai route.ts)
    const sessionsKey = `user:${userId}:sessions`;

    // SKENARIO 1: DETAIL CHAT (Jika ada ?id=...)
    if (id) {
        // Ambil isi pesan dari LIST user
        const chatKey = `user:${userId}:chat:${id}`;
        const rawMessages = await redis.lrange(chatKey, 0, -1);
        
        // Parse setiap pesan
        const messages = rawMessages.map(safeParse).filter(Boolean);
        
        return NextResponse.json({ messages });
    }

    // SKENARIO 2: SIDEBAR LIST (Jika tidak ada ?id=)
    // Ambil daftar sesi dari ZSET user (Sorted Set)
    const rawSessions = await redis.zrange(sessionsKey, 0, -1, { rev: true });
    
    // Parse dan format data untuk frontend
    const sessions = rawSessions.map((s: any) => {
        const obj = safeParse(s);
        if (!obj) return null;

        return { 
            id: obj.id, 
            title: obj.title, 
            timestamp: obj.timestamp,
            clientId: obj.clientId // <-- PENTING: Frontend butuh ini untuk gambar IPFS
        };
    }).filter(Boolean);

    // Ambil ClientID global (opsional, buat header)
    const globalClientId = await getClientId();
    
    const response = NextResponse.json(sessions);
    if (globalClientId) {
        response.headers.set('x-thirdweb-client-id', globalClientId);
    }
    
    return response;

  } catch (error) {
    console.error("Session Error:", error);
    // Return empty array on error to prevent frontend crash
    return NextResponse.json([], { status: 500 });
  }
}

// --- DELETE HANDLER (Hapus Sesi) ---
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    // A. VERIFIKASI USER
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const claims = await privy.verifyAuthToken(token);
    const userId = claims.userId;

    const sessionsKey = `user:${userId}:sessions`;
    const chatKey = `user:${userId}:chat:${id}`;

    // B. LOGIKA HAPUS (ZSET & LIST)
    // 1. Cari member spesifik di ZSET untuk dihapus (karena butuh string match exact)
    const allSessions = await redis.zrange(sessionsKey, 0, -1);
    const sessionToDelete = allSessions.find((s: any) => {
        const obj = safeParse(s);
        return obj && obj.id === id;
    });

    if (sessionToDelete) {
        // Hapus metadata dari Sidebar (ZSET)
        await redis.zrem(sessionsKey, sessionToDelete as string);
        
        // Hapus isi pesan Chat (LIST)
        await redis.del(chatKey);
        
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}