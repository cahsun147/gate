'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useRef } from 'react'
import { Send, MediaImage, Xmark } from 'iconoir-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'image'
}

type MainChatProps = {
  messages: ChatMessage[]
  input: string
  isLoading: boolean
  presence?: string | null
  selectedImage: string | null
  onInputChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onClearImage: () => void
  title?: string
}

function MarkdownMessage(props: { content: string }): JSX.Element {
  const { content } = props

  return (
    <div className="flex flex-col gap-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href ?? '#'}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2 text-secondary-high-2 break-all hover:text-secondary-high-1"
            >
              {children}
            </a>
          ),
          p: ({ children }) => <p className="whitespace-pre-wrap break-words">{children}</p>,
          h1: ({ children }) => <h2 className="font-semibold text-primary-high-2 text-base sm:text-lg">{children}</h2>,
          h2: ({ children }) => <h3 className="font-semibold text-primary-high-2 text-sm sm:text-base">{children}</h3>,
          h3: ({ children }) => <h4 className="font-semibold text-primary-high-2 text-sm">{children}</h4>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="whitespace-pre-wrap break-words">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary-main-9/40 pl-3 text-primary-main-4">
              {children}
            </blockquote>
          ),
          pre: ({ children }) => (
            <pre className="w-full overflow-x-auto rounded-xl bg-black/40 border border-primary-main-9/30 p-3 text-xs sm:text-sm">
              {children}
            </pre>
          ),
          code: ({ children, className }) => {
            const isBlock = Boolean(className)
            return (
              <code
                className={
                  isBlock
                    ? 'font-mono whitespace-pre'
                    : 'px-1 py-0.5 rounded bg-black/40 border border-primary-main-9/30 font-mono text-[0.85em]'
                }
              >
                {children}
              </code>
            )
          },
          table: ({ children }) => (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-xs sm:text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="text-left font-semibold p-2 border border-primary-main-9/30 bg-black/30">{children}</th>
          ),
          td: ({ children }) => <td className="p-2 border border-primary-main-9/20">{children}</td>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export function MainChat(props: MainChatProps): JSX.Element {
  const {
    messages,
    input,
    isLoading,
    presence,
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
    <div className="flex flex-1 flex-col min-w-0 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-end gap-6">
          {messages.length === 0 ? (
            <div className="w-full text-primary-main-4">
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 bg-primary-main-3/[0.05] border border-primary-main-9/40 rounded-2xl mb-4 flex items-center justify-center text-3xl">
                  🤖
                </div>
                <h2 className="text-xl font-semibold text-primary-high-2">{title}</h2>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[85%] text-xs sm:text-sm md:text-base leading-relaxed border ${
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
                  {msg.role === 'assistant' ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && presence && (
            <div className="w-full flex gap-4">
              <span className="animate-pulse text-primary-main-4 text-xs sm:text-sm">{presence}</span>
            </div>
          )}

          {isLoading && !presence && !messages[messages.length - 1]?.content && (
            <div className="w-full flex gap-4">
              <span className="animate-pulse text-primary-main-4 text-xs sm:text-sm">Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="pt-6">
        <div className="w-full relative">
          {selectedImage && (
            <div className="absolute -top-16 left-0 bg-black/70 p-2 rounded border border-primary-main-9/40 flex items-center gap-2">
              <img src={selectedImage} alt="Preview" className="h-10 w-10 object-cover rounded" />
              <button type="button" onClick={onClearImage} className="text-error-main-4 hover:text-error-high-2">
                <Xmark width={14} height={14} />
              </button>
            </div>
          )}


          <form onSubmit={onSubmit} className="relative flex items-stretch gap-2">
            <label className="w-12 h-12 flex items-center justify-center text-primary-main-4 hover:text-primary-high-2 cursor-pointer hover:bg-primary-main-3/[0.05] rounded-xl transition-colors border border-primary-main-9/40">
              <MediaImage width={18} height={18} />
              <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} disabled={isLoading} />
            </label>

            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Message XGate AI..."
              className="w-full h-12 bg-black/30 text-primary-high-2 border border-primary-main-9/40 rounded-xl pl-4 pr-14 py-3 focus:outline-none focus:border-primary-high-2"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-primary-high-2 text-black rounded-lg hover:bg-primary-high-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send width={18} height={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
