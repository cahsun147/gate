"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Plus, ChatBubble, Trash, Menu, Xmark, MediaImage } from "iconoir-react";

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
  const [isSidebarOpen, setSidebarOpen] = useState(true);
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

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (id === currentSessionId) createNewSession();
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
             } catch(e) {}
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
    <div className="flex h-screen bg-[#111] text-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed md:relative z-20 w-64 h-full bg-[#1a1a1a] border-r border-gray-800 transition-transform duration-300 md:translate-x-0 flex flex-col`}>
        <div className="p-4">
          <button onClick={createNewSession} className="flex items-center gap-2 w-full px-4 py-3 bg-[#262626] hover:bg-[#333] rounded-md border border-gray-700 text-sm font-medium transition-all group">
            <Plus width={16} height={16} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {sessions.map((s) => (
            <div key={s.id} onClick={() => loadSession(s.id)} className={`group flex justify-between px-3 py-3 rounded-md cursor-pointer text-sm ${currentSessionId === s.id ? "bg-[#262626] text-white" : "text-gray-400 hover:bg-[#262626]"}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <ChatBubble width={14} height={14} />
                <span className="truncate max-w-[140px]">{s.title}</span>
              </div>
              <button onClick={(e) => deleteSession(e, s.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400"><Trash width={14} height={14} /></button>
            </div>
          ))}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative w-full">
        <div className="md:hidden p-4 border-b border-gray-800 flex justify-between bg-[#111]">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)}>{isSidebarOpen ? <Xmark /> : <Menu />}</button>
          <span className="font-bold">XGate AI</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="w-16 h-16 bg-[#262626] rounded-2xl mb-4 flex items-center justify-center text-3xl">🤖</div>
              <h2 className="text-xl font-semibold text-white">XGate AI Assistant</h2>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">AI</div>}
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed ${msg.role === "user" ? "bg-[#262626] text-white" : "text-gray-100"}`}>
                  {msg.type === "image" && msg.role === "user" && <div className="mb-2 text-xs text-gray-400 flex items-center gap-1"><MediaImage width={12} height={12}/> [Image Attached]</div>}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                {msg.role === "user" && <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">U</div>}
              </div>
            ))
          )}
          {isLoading && !messages[messages.length - 1]?.content && <div className="max-w-3xl mx-auto flex gap-4"><div className="w-8 h-8 bg-green-600 rounded-full"></div><span className="animate-pulse">Thinking...</span></div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-[#111] border-t border-gray-800">
          <div className="max-w-3xl mx-auto relative">
            {selectedImage && <div className="absolute -top-16 left-0 bg-[#262626] p-2 rounded border border-gray-700 flex items-center gap-2"><img src={selectedImage} alt="Preview" className="h-10 w-10 object-cover rounded" /><button onClick={() => setSelectedImage(null)} className="text-red-400 hover:text-red-300"><Xmark width={14} height={14}/></button></div>}
            <form onSubmit={handleSubmit} className="relative flex gap-2">
              <label className="p-3 text-gray-400 hover:text-white cursor-pointer hover:bg-[#262626] rounded-xl transition-colors"><MediaImage width={20} height={20} /><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading}/></label>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message XGate AI..." className="w-full bg-[#262626] text-white border border-gray-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-gray-500" disabled={isLoading}/>
              <button type="submit" disabled={isLoading || (!input.trim() && !selectedImage)} className="absolute right-2 top-2 p-1.5 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50"><Send width={18} height={18} /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}