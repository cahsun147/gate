'use client'

import { useState } from 'react'
import { Animated, Animator, BleepsOnAnimator, cx, FrameOctagon, Illuminator } from '@arwes/react'
import { Menu, Xmark } from 'iconoir-react'

import { type BleepNames, theme } from '@/config'
import { useAppBreakpoint } from '../tools/useAppBreakpoint'

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
  const isLG = useAppBreakpoint('lg')
  const isXL = useAppBreakpoint('xl')

  return (
    <div className={cx('flex flex-1 flex-col w-full min-w-0 min-h-0', className)}>
      <Animator combine>
        <BleepsOnAnimator<BleepNames> transitions={{ entering: 'type' }} />

        <div className="relative flex flex-col flex-1 w-full min-w-0 min-h-0">
          {!isLG && (
            <div className="px-4 pt-4">
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setSidebarOpen(true)} className="text-primary-high-2">
                  <Menu />
                </button>
                <span className="font-cta text-size-10 text-primary-high-2">{title}</span>
                <span className="w-6" />
              </div>
            </div>
          )}

          {!isLG && isSidebarOpen && (
            <div className="fixed inset-0 z-50">
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
                <div className="p-2" onClickCapture={() => setSidebarOpen(false)}>
                  {sidebar}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col flex-1 min-h-0 w-full">
            <div className="flex flex-col flex-1 w-full min-w-0 min-h-0 px-2 md:px-4">
              <div className="flex flex-1 w-full min-w-0 min-h-0 gap-4">
                {isLG && (
                  <aside className="sticky top-0 flex w-full min-w-0 max-w-[16rem] min-h-0 h-full">
                    <Animator>
                      <Animated className="relative flex w-full min-h-0 h-full" animated={['flicker']}>
                        <FrameOctagon
                          style={{
                            // @ts-expect-error css variables
                            '--arwes-frames-bg-color': theme.colors.primary.main(9, { alpha: 0.1 }),
                            '--arwes-frames-line-color': theme.colors.primary.main(9, { alpha: 0.5 })
                          }}
                          squareSize={theme.spacen(2)}
                        />
                        {isXL && (
                          <div className="absolute inset-0 overflow-hidden">
                            <Illuminator
                              color={theme.colors.primary.main(7, { alpha: 0.1 })}
                              size={theme.spacen(100)}
                            />
                          </div>
                        )}
                        <div className="relative flex flex-col p-4 w-full min-h-0 h-full overflow-hidden">
                          {sidebar}
                        </div>
                      </Animated>
                    </Animator>
                  </aside>
                )}

                <main
                  className={
                    mainClassName ??
                    'flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden pl-2 pr-6 md:pl-4 md:pr-10'
                  }
                >
                  {children}
                </main>
              </div>
            </div>
          </div>
        </div>
      </Animator>
    </div>
  )
}
