import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// GET Handler: Menangani 2 skenario
// 1. /api/chat-v2/sessions          -> Return List Sesi (untuk Sidebar)
// 2. /api/chat-v2/sessions?id=123   -> Return Detail Chat (untuk Main Chat)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    // SKENARIO 1: Ambil Detail Pesan (Load Isi Chat)
    if (id) {
      // Ambil semua pesan dari List Redis
      const rawMessages = await redis.lrange(`chat:messages:${id}`, 0, -1);
      
      // Redis menyimpan data sebagai String JSON. 
      // Kita perlu parse kembali menjadi Object agar bisa dibaca Frontend.
      const messages = rawMessages.map((msg: any) => {
         return typeof msg === 'string' ? JSON.parse(msg) : msg;
      });

      return NextResponse.json({ messages });
    }

    // SKENARIO 2: Ambil Daftar Sesi (Sidebar History)
    // Mengambil dari ZSET "chat:sessions", urut dari timestamp terbaru (rev: true)
    const sessions = await redis.zrange("chat:sessions", 0, -1, { rev: true });
    
    return NextResponse.json(sessions);

  } catch (error) {
    console.error("Redis Error:", error);
    // Return array kosong jika error agar frontend tidak crash
    return NextResponse.json([], { status: 500 });
  }
}

// DELETE Handler: Menghapus Sesi
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    // 1. Hapus isi pesan chat (LIST)
    await redis.del(`chat:messages:${id}`);
    
    // 2. Hapus dari daftar sesi (ZSET)
    // Karena ZREM membutuhkan "member" yang persis sama (termasuk title & timestamp),
    // kita harus mencari object member-nya dulu berdasarkan ID.
    
    // Ambil semua sesi
    const allSessions: any[] = await redis.zrange("chat:sessions", 0, -1);
    
    // Cari sesi yang ID-nya cocok
    const sessionToDelete = allSessions.find((s) => s.id === id);
    
    // Jika ketemu, hapus member tersebut dari ZSET
    if (sessionToDelete) {
        await redis.zrem("chat:sessions", sessionToDelete);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}