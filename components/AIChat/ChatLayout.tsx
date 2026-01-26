'use client'

import { useState } from 'react'
import { Menu, Xmark } from 'iconoir-react'

type ChatLayoutProps = {
  sidebar: React.ReactNode
  children: React.ReactNode
  title?: string
  className?: string
  mainClassName?: string
  sidebarClassName?: string
}

export function ChatLayout(props: ChatLayoutProps): JSX.Element {
  const {
    sidebar,
    children,
    title = 'XGate AI',
    className,
    mainClassName,
    sidebarClassName
  } = props

  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={className ?? 'flex flex-col w-full min-h-0'}>
      <div className="md:hidden px-4 pt-4">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setSidebarOpen(true)} className="text-primary-high-2">
            <Menu />
          </button>
          <span className="font-cta text-size-10 text-primary-high-2">{title}</span>
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
          <div className={sidebarClassName ?? 'absolute left-0 top-0 h-full w-[18rem] bg-black'}>
            <div className="flex items-center justify-between p-4">
              <span className="font-cta text-size-10 text-primary-high-2">Chats</span>
              <button type="button" onClick={() => setSidebarOpen(false)} className="text-primary-high-2">
                <Xmark />
              </button>
            </div>
            <div className="p-2">{sidebar}</div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 w-full">
        <div className="w-full min-w-0 min-h-0 px-2 md:px-4">
          <div className="flex w-full min-w-0 min-h-0 gap-4">
            <aside className="hidden md:flex w-[16rem] min-w-0 min-h-0">
              <div className="w-full min-w-0 min-h-0">{sidebar}</div>
            </aside>

            <main className={mainClassName ?? 'flex-1 min-w-0 min-h-0 pl-2 pr-6 md:pl-4 md:pr-10'}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
