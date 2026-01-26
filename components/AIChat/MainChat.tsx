'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useRef } from 'react'
import { Send, MediaImage, Xmark } from 'iconoir-react'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'image'
}

type MainChatProps = {
  messages: ChatMessage[]
  input: string
  isLoading: boolean
  selectedImage: string | null
  onInputChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onClearImage: () => void
  title?: string
}

export function MainChat(props: MainChatProps): JSX.Element {
  const {
    messages,
    input,
    isLoading,
    selectedImage,
    onInputChange,
    onSubmit,
    onImageUpload,
    onClearImage,
    title = 'XGate AI Assistant'
  } = props

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col min-w-0 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-primary-main-4">
            <div className="w-16 h-16 bg-primary-main-3/[0.05] border border-primary-main-9/40 rounded-2xl mb-4 flex items-center justify-center text-3xl">
              🤖
            </div>
            <h2 className="text-xl font-semibold text-primary-high-2">{title}</h2>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-primary-main-3/[0.05] border-primary-main-9/40 text-primary-high-2'
                    : 'bg-black/30 border-primary-main-9/30 text-primary-high-2'
                }`}
              >
                {msg.type === 'image' && msg.role === 'user' && (
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
              <button type="button" onClick={onClearImage} className="text-error-main-4 hover:text-error-high-2">
                <Xmark width={14} height={14} />
              </button>
            </div>
          )}

          <form onSubmit={onSubmit} className="relative flex gap-2">
            <label className="p-3 text-primary-main-4 hover:text-primary-high-2 cursor-pointer hover:bg-primary-main-3/[0.05] rounded-xl transition-colors border border-primary-main-9/40">
              <MediaImage width={20} height={20} />
              <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} disabled={isLoading} />
            </label>

            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
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
  )
}
