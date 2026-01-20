import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// GET Handler
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    // A. SKENARIO DETAIL PESAN (Load Chat)
    if (id) {
      const rawMessages = await redis.lrange(`chat:messages:${id}`, 0, -1);
      const messages = rawMessages.map((msg: any) => {
         return typeof msg === 'string' ? JSON.parse(msg) : msg;
      });
      return NextResponse.json({ messages });
    }

    // B. SKENARIO SIDEBAR (List Sessions)
    const rawSessions = await redis.zrange("chat:sessions", 0, -1, { rev: true });
    
    // Safety Parsing: Pastikan data yang dikirim ke frontend adalah Object, bukan String
    const sessions = rawSessions.map((s: any) => {
        return typeof s === 'string' ? JSON.parse(s) : s;
    });
    
    return NextResponse.json(sessions);

  } catch (error) {
    console.error("Redis Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// DELETE Handler
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await redis.del(`chat:messages:${id}`);
    
    // Cari member spesifik untuk dihapus dari ZSET
    const allSessions: any[] = await redis.zrange("chat:sessions", 0, -1);
    // Parse dulu jika string, untuk pencarian
    const sessionToDelete = allSessions.find((s) => {
        const obj = typeof s === 'string' ? JSON.parse(s) : s;
        return obj.id === id;
    });
    
    if (sessionToDelete) {
        // Hapus member asli (raw) dari Redis
        await redis.zrem("chat:sessions", sessionToDelete);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}