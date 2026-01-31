'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

import type { ChatMessage } from './MainChat'

export type AIChatSession = {
  id: string
  title: string
  timestamp: number
}

type UseAIChatOptions = {
  apiBasePath?: string
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const { apiBasePath = '/api/chat-v2' } = options

  const [sessions, setSessions] = useState<AIChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [presence, setPresence] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const refreshSidebar = useCallback(async () => {
    try {
      const res = await fetch(`${apiBasePath}/sessions`)
      if (res.ok) setSessions(await res.json())
    } catch (e) {}
  }, [apiBasePath])

  useEffect(() => {
    refreshSidebar()
  }, [refreshSidebar])

  const createNewSession = useCallback(() => {
    setCurrentSessionId(null)
    setMessages([])
    setSelectedImage(null)
  }, [])

  const loadSession = useCallback(
    async (id: string) => {
      setCurrentSessionId(id)
      setIsLoading(true)

      try {
        const res = await fetch(`${apiBasePath}/sessions?id=${encodeURIComponent(id)}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])
        }
      } finally {
        setIsLoading(false)
      }
    },
    [apiBasePath]
  )

  const deleteSessionById = useCallback(
    async (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id))
      if (id === currentSessionId) createNewSession()
      await fetch(`${apiBasePath}/sessions?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    },
    [apiBasePath, createNewSession, currentSessionId]
  )

  const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => setSelectedImage(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const clearImage = useCallback(() => {
    setSelectedImage(null)
  }, [])

  const submit = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault()
      if ((!input.trim() && !selectedImage) || isLoading) return

      setPresence(null)

      const userMsg: ChatMessage = {
        role: 'user',
        content: input,
        type: selectedImage ? 'image' : 'text'
      }

      setMessages((prev) => [...prev, userMsg])

      const imageToSend = selectedImage
      setInput('')
      setSelectedImage(null)
      setIsLoading(true)

      try {
        const response = await fetch(apiBasePath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMsg.content,
            image: imageToSend,
            session_id: currentSessionId
          })
        })

        if (!response.ok) throw new Error('Network error')

        const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
        setMessages((prev) => [...prev, assistantMsg])

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let done = false
        let fullResponse = ''
        let hasUpdatedId = false
        let buffer = ''

        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          buffer += decoder.decode(value, { stream: !done })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue

            const payload = trimmed.replace(/^data:\s*/, '')
            try {
              const json = JSON.parse(payload)

              if (json.type === 'init') {
                if (json.session_id && (!currentSessionId || !hasUpdatedId)) {
                  setCurrentSessionId(json.session_id)
                  hasUpdatedId = true
                  setTimeout(refreshSidebar, 500)
                }
                continue
              }

              if (json.type === 'presence') {
                if (typeof json.data === 'string') setPresence(json.data)
                continue
              }

              if (json.v) {
                setPresence(null)
                fullResponse += json.v
                setMessages((prev) => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  if (last && last.role === 'assistant') last.content = fullResponse
                  return updated
                })
              }
            } catch (e) {}
          }
        }
      } catch (error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Error...' }])
      } finally {
        setIsLoading(false)
        setPresence(null)
      }
    },
    [apiBasePath, currentSessionId, input, isLoading, refreshSidebar, selectedImage]
  )

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
    deleteSessionById,
    handleImageUpload,
    clearImage,
    submit
  }
}
