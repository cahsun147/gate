'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

import type { ChatMessage } from './MainChat'

export type AIChatSession = {
  id: string
  title: string
  timestamp: number
  clientId?: string // Opsional: Untuk keperluan gambar IPFS
}

type UseAIChatOptions = {
  apiBasePath?: string
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const { apiBasePath = '/api/chat-v2' } = options
  
  // 1. Ambil Auth Token dari Privy
  const { getAccessToken, authenticated } = usePrivy()

  const [sessions, setSessions] = useState<AIChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [presence, setPresence] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // --- 2. FUNGSI FETCH DENGAN AUTH ---
  
  // A. Load Daftar Session (Sidebar)
  const refreshSidebar = useCallback(async () => {
    // Jika belum login, jangan fetch (atau kosongkan)
    // if (!authenticated) return; 
    
    try {
      const token = await getAccessToken(); // Ambil Token Terbaru
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${apiBasePath}/sessions`, { headers })
      if (res.ok) {
        setSessions(await res.json())
      }
    } catch (e) {
      console.error("Failed to load sidebar", e)
    }
  }, [apiBasePath, getAccessToken, authenticated])

  // B. Load Detail Chat (MainChat History) -> INI YANG MEMPERBAIKI HISTORY KOSONG
  const loadSession = useCallback(async (id: string) => {
    setCurrentSessionId(id)
    setIsLoading(true)
    try {
      const token = await getAccessToken();
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${apiBasePath}/sessions?id=${id}`, { headers })
      
      if (res.ok) {
        const data = await res.json()
        // Pastikan format data sesuai dengan yang dikirim backend ({ messages: [] })
        if (data.messages) {
            setMessages(data.messages)
        } else {
            setMessages([])
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }, [apiBasePath, getAccessToken])

  // C. Delete Session -> INI YANG MEMPERBAIKI ERROR 401
  const deleteSession = useCallback(async (id: string) => {
    // Optimistic Update: Hapus dari UI dulu biar cepat
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (currentSessionId === id) {
      setCurrentSessionId(null)
      setMessages([])
    }

    try {
      const token = await getAccessToken();
      if (!token) {
          console.error("Cannot delete: No token");
          return;
      }

      await fetch(`${apiBasePath}/sessions?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` } // Wajib Header Ini
      })
      
      // Refresh sidebar lagi untuk memastikan sinkronisasi (opsional)
      // refreshSidebar() 
    } catch (error) {
      console.error('Failed to delete session:', error)
      refreshSidebar() // Revert jika gagal (kembalikan sidebar)
    }
  }, [apiBasePath, currentSessionId, getAccessToken, refreshSidebar])

  // D. Create New Chat
  const createNewSession = useCallback(() => {
    setCurrentSessionId(null)
    setMessages([])
    setInput('')
  }, [])

  // E. Send Message (Chatting)
  const sendMessage = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault()
      if (!input.trim() && !selectedImage) return

      // Cek Login
      const token = await getAccessToken();
      if (!token) {
          alert("Please login first!"); // Atau handle UI login
          return;
      }

      const userMsg: ChatMessage = { role: 'user', content: input, type: 'text' }
      if (selectedImage) {
        // Logic image handling (sesuaikan jika backend support image content array)
        // userMsg.content = ... 
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setSelectedImage(null)
      setIsLoading(true)

      try {
        const res = await fetch(apiBasePath, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Wajib Header Ini
          },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            sessionId: currentSessionId,
            image: selectedImage
          }),
        })

        if (!res.ok || !res.body) throw new Error(res.statusText)

        // Streaming Response Handler
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ''
        let hasUpdatedId = false

        setMessages((prev) => [...prev, { role: 'assistant', content: '', type: 'text' }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const jsonStr = line.slice(6) // Remove "data: "
              if (jsonStr === '[DONE]') continue
              
              const json = JSON.parse(jsonStr)

              // Handle Session ID Update (untuk chat baru)
              if (json.session_id && (!currentSessionId || !hasUpdatedId)) {
                setCurrentSessionId(json.session_id)
                hasUpdatedId = true
                setTimeout(refreshSidebar, 1000) // Delay dikit biar Redis sempat update
              }

              // Handle Token/Text
              if (json.v) {
                setPresence(null)
                fullResponse += json.v
                setMessages((prev) => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  if (last && last.role === 'assistant') {
                      last.content = fullResponse
                  }
                  return updated
                })
              }
            } catch (e) {}
          }
        }
      } catch (error) {
        console.error("Chat error:", error)
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Failed to connect.', type: 'text' }])
      } finally {
        setIsLoading(false)
        setPresence(null)
      }
    },
    [apiBasePath, currentSessionId, input, messages, selectedImage, getAccessToken, refreshSidebar]
  )

  // Load sidebar on mount (and on auth change)
  useEffect(() => {
    refreshSidebar()
  }, [refreshSidebar])

  return {
    sessions,
    currentSessionId,
    messages,
    input,
    isLoading,
    presence,
    selectedImage,
    setInput,
    refreshSidebar,
    createNewSession,
    loadSession,
    deleteSession, // Pastikan ini di-export
    sendMessage,
    handleImageSelect: (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => setSelectedImage(reader.result as string)
        reader.readAsDataURL(file)
      }
    },
    clearImage: () => setSelectedImage(null),
  }
}