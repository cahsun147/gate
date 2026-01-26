'use client'

import { useState } from 'react'
import { Menu, Xmark } from 'iconoir-react'

import { MainChat, LayoutContent, NavChat, useAIChat, type NavChatSession } from '@/components'

export default function ChatPageV3(): JSX.Element {
  const {
    sessions,
    currentSessionId,
    messages,
    input,
    isLoading,
    selectedImage,
    setInput,
    createNewSession,
    loadSession,
    deleteSessionById,
    handleImageUpload,
    clearImage,
    submit
  } = useAIChat({ apiBasePath: '/api/chat-v2' })

  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const navSessions: NavChatSession[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    timestamp: s.timestamp
  }))

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
                onNewChat={() => {
                  createNewSession()
                  setSidebarOpen(false)
                }}
                onSelectSession={async (id) => {
                  await loadSession(id)
                  setSidebarOpen(false)
                }}
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
        <MainChat
          title="XGate AI Assistant"
          messages={messages}
          input={input}
          isLoading={isLoading}
          selectedImage={selectedImage}
          onInputChange={setInput}
          onSubmit={(e) => submit(e)}
          onImageUpload={handleImageUpload}
          onClearImage={clearImage}
        />
      </LayoutContent>
    </div>
  )
}
