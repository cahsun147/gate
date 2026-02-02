'use client'

import { memo } from 'react'
import { Animator, Animated, cx, flicker, styleFrameClipOctagon } from '@arwes/react'
import { Plus, ChatBubble, Trash } from 'iconoir-react'

import { theme } from '@/config'

export type NavChatSession = {
  id: string
  title: string
  timestamp: number
}

type NavChatProps = {
  className?: string
  sessions: NavChatSession[]
  currentSessionId: string | null
  onNewChat: () => void
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
}

const NavChat = memo((props: NavChatProps): JSX.Element => {
  const { className, sessions, currentSessionId, onNewChat, onSelectSession, onDeleteSession } = props

  return (
    <div className={cx('flex flex-1 flex-col w-full min-w-0 min-h-0', className)}>
      <div className="flex">
        <button
          type="button"
          onClick={onNewChat}
          className={cx(
            'flex items-center gap-2 w-full px-4 py-3',
            'bg-primary-main-3/[0.05] hover:bg-primary-main-3/[0.08]',
            'border border-primary-main-9/40',
            'text-primary-high-2',
            'transition-colors'
          )}
          style={{
            clipPath: styleFrameClipOctagon({
              leftTop: false,
              leftBottom: false,
              squareSize: theme.space(2)
            })
          }}
        >
          <Plus width={16} height={16} />
          <span className="font-cta text-size-9">New Chat</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 mt-4 overflow-y-auto">
        <Animator combine manager="stagger" duration={{ stagger: 0.015 }}>
          <ul className="flex flex-col w-full">
            {sessions.map((s) => {
              const active = currentSessionId === s.id
              return (
                <li key={s.id} className="flex flex-col">
                  <Animator>
                    <Animated animated={flicker()}>
                      <div
                        className={cx(
                          'group flex items-center justify-between w-full',
                          'transition-colors',
                          !active && 'text-primary-main-4 hover:text-primary-high-2',
                          active && 'text-secondary-main-4 hover:text-secondary-high-2'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectSession(s.id)}
                          className={cx(
                            'flex-1 flex flex-row items-center gap-2 px-4 py-2',
                            active && 'bg-secondary-main-3/[0.05]'
                          )}
                          style={{
                            clipPath: styleFrameClipOctagon({
                              leftTop: false,
                              leftBottom: false,
                              squareSize: theme.space(2)
                            })
                          }}
                        >
                          <ChatBubble width={14} height={14} />
                          <span className="truncate font-cta text-size-9">{s.title}</span>
                        </button>

                        <div className="pr-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => onDeleteSession(s.id)}
                            className={cx(
                              'opacity-0 group-hover:opacity-100 transition-opacity',
                              'text-primary-main-4 hover:text-error-main-4'
                            )}
                            aria-label="Delete session"
                          >
                            <Trash width={14} height={14} />
                          </button>
                        </div>
                      </div>
                    </Animated>
                  </Animator>
                </li>
              )
            })}
          </ul>
        </Animator>
      </div>
    </div>
  )
})

NavChat.displayName = 'NavChat'

export { NavChat }
