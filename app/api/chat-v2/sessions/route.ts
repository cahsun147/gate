import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// HELPER: Safe Parse
function safeParse(data: any) {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return null; }
  }
  return data;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    // 1. DETAIL CHAT (Isi Pesan)
    if (id) {
      // Baca dari LIST 'chat:history:ID'
      const rawMessages = await redis.lrange(`chat:history:${id}`, 0, -1);
      const messages = rawMessages.map(safeParse).filter(Boolean);
      return NextResponse.json({ messages });
    }

    // 2. LIST SIDEBAR
    const rawSessions = await redis.zrange("chat:sessions", 0, -1, { rev: true });
    const sessions = rawSessions.map(safeParse).filter(Boolean);
    return NextResponse.json(sessions);

  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

// DELETE Handler (Sesuaikan Key)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await redis.del(`chat:history:${id}`); // Hapus History List
    
    // Hapus dari ZSET (Sidebar)
    const allSessions = await redis.zrange("chat:sessions", 0, -1);
    const sessionToDelete = allSessions.find((s: any) => {
        const obj = safeParse(s);
        return obj && obj.id === id;
    });
    if (sessionToDelete) await redis.zrem("chat:sessions", sessionToDelete);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}