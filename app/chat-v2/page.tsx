"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Menu, Xmark, MediaImage } from "iconoir-react";

import { LayoutContent, NavChat, type NavChatSession } from "@/components";

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
  // KEMBALI KE NULL: Tunggu server/Thirdweb yang kasih ID
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Sidebar
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/chat-v2/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
          // Jangan auto-load session jika user ingin "New Chat" di awal
          // Tapi jika history ada, bisa opsi load yang terakhir (opsional)
        }
      } catch (e) {}
    };
    fetchHistory();
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const refreshSidebar = async () => {
    try {
      const res = await fetch("/api/chat-v2/sessions");
      if (res.ok) setSessions(await res.json());
    } catch (e) {}
  };

  const createNewSession = () => {
    setCurrentSessionId(null); // Reset ke Null
    setMessages([]);
    setSidebarOpen(false);
    setSelectedImage(null);
  };

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
    } finally { setIsLoading(false); }
  };

  const deleteSessionById = async (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (id === currentSessionId) createNewSession();
    await fetch(`/api/chat-v2/sessions?id=${id}`, { method: "DELETE" });
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteSessionById(id);
  };

  const navSessions: NavChatSession[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    timestamp: s.timestamp,
  }));

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

    const userMsg: Message = { role: "user", content: input, type: selectedImage ? "image" : "text" };
    setMessages([...messages, userMsg]);

    const imageToSend = selectedImage;
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          image: imageToSend,
          session_id: currentSessionId, // Kirim NULL jika chat pertama
        }),
      });

      if (!response.ok) throw new Error("Network error");

      const assistantMsg: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMsg]);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = "";
      let hasUpdatedId = false; // Flag agar refresh sidebar cuma sekali

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: !done });

        const lines = chunkValue.split("\n");
        for (const line of lines) {
          // 1. TANGKAP SESSION ID DARI SERVER (Event Init)
          // Backend akan meneruskan event init dari Thirdweb
          if (line.includes(`"type":"init"`)) {
            try {
              const json = JSON.parse(line.replace("data: ", ""));
              // Jika ID baru diterima & belum diupdate di state
              if (json.session_id && (!currentSessionId || !hasUpdatedId)) {
                setCurrentSessionId(json.session_id);
                hasUpdatedId = true;
                // Beri jeda sedikit agar backend selesai simpan ke Redis sebelum kita fetch sidebar
                setTimeout(refreshSidebar, 500);
              }
            } catch (e) {}
          }

          // 2. TANGKAP TEKS JAWABAN
          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.replace("data:", ""));
              if (json.v) {
                fullResponse += json.v;
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
      setMessages((prev) => [...prev, { role: "assistant", content: "Error..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-0">
      <div className="md:hidden px-4 pt-4">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setSidebarOpen(true)} className="text-primary-high-2">
            <Menu />
          </button>
          <span className="font-cta text-size-10 text-primary-high-2">XGate AI</span>
          <span className="w-6" />
        </div>
      </div>

      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="absolute left-0 top-0 h-full w-[18rem] bg-black">
            <div className="flex items-center justify-between p-4">
              <span className="font-cta text-size-10 text-primary-high-2">Chats</span>
              <button type="button" onClick={() => setSidebarOpen(false)} className="text-primary-high-2">
                <Xmark />
              </button>
            </div>
            <div className="p-2">
              <NavChat
                sessions={navSessions}
                currentSessionId={currentSessionId}
                onNewChat={createNewSession}
                onSelectSession={loadSession}
                onDeleteSession={deleteSessionById}
              />
            </div>
          </div>
        </div>
      )}

      <LayoutContent
        left={
          <NavChat
            className="mb-auto"
            sessions={navSessions}
            currentSessionId={currentSessionId}
            onNewChat={createNewSession}
            onSelectSession={loadSession}
            onDeleteSession={deleteSessionById}
          />
        }
      >
        <div className="flex flex-col min-w-0 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-primary-main-4">
                <div className="w-16 h-16 bg-primary-main-3/[0.05] border border-primary-main-9/40 rounded-2xl mb-4 flex items-center justify-center text-3xl">
                  🤖
                </div>
                <h2 className="text-xl font-semibold text-primary-high-2">XGate AI Assistant</h2>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed border ${
                      msg.role === "user"
                        ? "bg-primary-main-3/[0.05] border-primary-main-9/40 text-primary-high-2"
                        : "bg-black/30 border-primary-main-9/30 text-primary-high-2"
                    }`}
                  >
                    {msg.type === "image" && msg.role === "user" && (
                      <div className="mb-2 text-xs text-primary-main-4 flex items-center gap-1">
                        <MediaImage width={12} height={12} /> [Image Attached]
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))
            )}
            {isLoading && !messages[messages.length - 1]?.content && (
              <div className="max-w-3xl mx-auto flex gap-4">
                <span className="animate-pulse text-primary-main-4">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="pt-6">
            <div className="max-w-3xl mx-auto relative">
              {selectedImage && (
                <div className="absolute -top-16 left-0 bg-black/70 p-2 rounded border border-primary-main-9/40 flex items-center gap-2">
                  <img src={selectedImage} alt="Preview" className="h-10 w-10 object-cover rounded" />
                  <button onClick={() => setSelectedImage(null)} className="text-error-main-4 hover:text-error-high-2">
                    <Xmark width={14} height={14} />
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="relative flex gap-2">
                <label className="p-3 text-primary-main-4 hover:text-primary-high-2 cursor-pointer hover:bg-primary-main-3/[0.05] rounded-xl transition-colors border border-primary-main-9/40">
                  <MediaImage width={20} height={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading} />
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message XGate AI..."
                  className="w-full bg-black/30 text-primary-high-2 border border-primary-main-9/40 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-primary-high-2"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !selectedImage)}
                  className="absolute right-2 top-2 p-1.5 bg-primary-high-2 text-black rounded-lg hover:bg-primary-high-1 disabled:opacity-50"
                >
                  <Send width={18} height={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </LayoutContent>
    </div>
  );
}