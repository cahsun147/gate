'use client'

import { ChatLayout, MainChat, NavChat, useAIChat, type NavChatSession } from '@/components'

export default function ChatPageV3(): JSX.Element {
  const {
    sessions,
    currentSessionId,
    messages,
    input,
    isLoading,
    presence,
    selectedImage,
    setInput,
    createNewSession,
    loadSession,
    deleteSession,
    handleImageSelect,
    clearImage,
    sendMessage
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
          onDeleteSession={deleteSession}
        />
      )}
    >
      <MainChat
        title="XGate AI Assistant"
        messages={messages}
        input={input}
        isLoading={isLoading}
        presence={presence}
        selectedImage={selectedImage}
        onInputChange={setInput}
        onSubmit={(e) => sendMessage(e)}
        onImageUpload={handleImageSelect}
        onClearImage={clearImage}
      />
    </ChatLayout>
  )
}
