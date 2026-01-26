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

        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          const chunkValue = decoder.decode(value, { stream: !done })

          const lines = chunkValue.split('\n')
          for (const line of lines) {
            if (!line) continue

            if (line.includes('"type":"init"')) {
              try {
                const json = JSON.parse(line.replace(/^data:\s*/, ''))
                if (json.session_id && (!currentSessionId || !hasUpdatedId)) {
                  setCurrentSessionId(json.session_id)
                  hasUpdatedId = true
                  setTimeout(refreshSidebar, 500)
                }
              } catch (e) {}
            }

            if (line.startsWith('data:')) {
              try {
                const json = JSON.parse(line.replace(/^data:\s*/, ''))
                if (json.v) {
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
        }
      } catch (error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Error...' }])
      } finally {
        setIsLoading(false)
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
