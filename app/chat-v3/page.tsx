'use client'

import { ChatLayout, MainChat, NavChat, useAIChat, type NavChatSession } from '@/components'

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

  const navSessions: NavChatSession[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    timestamp: s.timestamp
  }))

  return (
    <ChatLayout
      title="XGate AI"
      sidebar={({ closeSidebar, isMobile }) => (
        <NavChat
          className="mb-auto"
          sessions={navSessions}
          currentSessionId={currentSessionId}
          onNewChat={() => {
            createNewSession()
            if (isMobile) closeSidebar()
          }}
          onSelectSession={async (id) => {
            await loadSession(id)
            if (isMobile) closeSidebar()
          }}
          onDeleteSession={deleteSessionById}
        />
      )}
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
    </ChatLayout>
  )
}
