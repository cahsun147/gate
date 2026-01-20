"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Send, Plus, ChatBubble, Trash, Menu, Xmark, MediaImage 
} from "iconoir-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image";
};

type ChatSession = {
  id: string;
  title: string;
  timestamp: number;
};

export default function ChatPageV2() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. LOAD SESSION LIST DARI SERVER (Bukan LocalStorage) ---
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      // Panggil API untuk ambil daftar history
      const res = await fetch("/api/chat-v2/sessions"); 
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        // Jika ada sesi, load yang paling baru
        if (data.length > 0) {
           loadSession(data[0].id);
        } else {
           createNewSession();
        }
      }
    } catch (error) {
      console.error("Gagal memuat sesi:", error);
    }
  };

  const createNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setSidebarOpen(false);
    setSelectedImage(null);
  };

  // --- 2. LOAD MESSAGE HISTORY DARI SERVER ---
  const loadSession = async (id: string) => {
    setCurrentSessionId(id);
    setSidebarOpen(false);
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/chat-v2/sessions?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Error loading chat:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Optimistic Update (Hapus di UI dulu biar cepat)
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);

    if (id === currentSessionId) {
       createNewSession();
    }

    // Panggil API Delete
    await fetch(`/api/chat-v2/sessions?id=${id}`, { method: "DELETE" });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: Message = { 
      role: "user", 
      content: input, 
      type: selectedImage ? "image" : "text"
    };

    // Update UI Langsung (Optimistic)
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    
    const imageToSend = selectedImage;
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content, // Kita kirim pesan baru saja, bukan full history!
          image: imageToSend,
          session_id: currentSessionId, // Server yang akan urus history berdasarkan ID ini
        }),
      });

      if (!response.ok) throw new Error("Network error");

      const assistantMsg: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMsg]);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = "";
      let detectedSessionId = currentSessionId;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: !done });
        
        const lines = chunkValue.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const jsonStr = line.replace("data:", "").trim();
              if (!jsonStr) continue;
              const parsed = JSON.parse(jsonStr);

              // Tangkap Session ID baru dari server (jika chat baru)
              if (parsed.session_id && !detectedSessionId) {
                detectedSessionId = parsed.session_id;
                setCurrentSessionId(parsed.session_id);
                // Refresh list session di sidebar
                fetchSessions(); 
              }

              if (parsed.v) {
                fullResponse += parsed.v;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = fullResponse;
                  return updated;
                });
              }
            } catch (e) { }
          }
        }
      }

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Gagal terhubung." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... (TAMPILAN UI SAMA PERSIS DENGAN V1, COPY PASTE BAGIAN RETURN DI SINI) ...
    // Pastikan import iconoir-react ada
    <div className="flex h-screen bg-[#111] text-gray-100 font-sans overflow-hidden">
        {/* Render UI yang sama, bedanya logika di atas sudah pakai fetch */}
        {/* Gunakan kode JSX return dari V1 sebelumnya */}
        <div className="flex h-full w-full items-center justify-center">
            <h1>Silakan Copy-Paste JSX Return dari V1, logika state sudah V2 Ready</h1>
        </div>
    </div>
  );
}