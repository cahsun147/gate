'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { Animator, AnimatorGeneralProvider } from '@arwes/react'

import {
  FrameEnergLIne,
  FrameGateFolderTabAssembler,
  FrameGateFolderTabGlassAssembler,
  FrameXGate,
  FrameGateOmniTerminal,
  FrameGateOmniTerminalAssembler,
  FrameGateOmniTerminalAssemblerEnterOnly
} from '@/components'

const PageTestFrame = (): JSX.Element => {
  const [active, setActive] = useState(true)

  useEffect(() => {
    const tid = setInterval(() => {
      setActive(false)
      setTimeout(() => setActive(true), 3000)
    }, 5000)
    return () => clearInterval(tid)
  }, [])

  return (
    <div className="flex-1 min-w-0 min-h-0 p-6 overflow-auto">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Test Frame</h1>
          <p className="text-sm opacity-70">Halaman ini untuk testing visual custom frames.</p>
        </div>

        <AnimatorGeneralProvider disabled={false} dismissed={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-[240px] overflow-hidden">
              <Animator active={active} duration={{ enter: 2.0, exit: 1.8 }}>
                <FrameEnergLIne />
              </Animator>
            </div>

            <div className="relative h-[240px] overflow-hidden">
              <Animator active={active} duration={{ enter: 2.5, exit: 2.2 }}>
                <FrameXGate />
              </Animator>
            </div>

            <div className="relative h-[240px] overflow-hidden md:col-span-2">
              <Animator active={active} duration={{ enter: 5.0, exit: 2.5 }}>
                <FrameGateFolderTabAssembler />
              </Animator>
            </div>

            <div className="relative h-[240px] overflow-hidden md:col-span-2">
              <FrameGateFolderTabAssembler
                style={
                  {
                    '--arwes-frames-bg-color': 'hsl(60, 75%, 10%)',
                    '--arwes-frames-bg-filter': 'drop-shadow(0 0 2px hsl(60, 75%, 10%))',
                    '--arwes-frames-line-color': 'hsl(60, 75%, 25%)',
                    '--arwes-frames-line-filter': 'drop-shadow(0 0 2px hsl(60, 75%, 25%))',
                    '--arwes-frames-deco-color': 'hsl(60, 75%, 50%)',
                    '--arwes-frames-deco-filter': 'drop-shadow(0 0 2px hsl(60, 75%, 50%))'
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="relative h-[240px] overflow-hidden md:col-span-2">
              <FrameGateFolderTabGlassAssembler
                style={
                  {
                    '--arwes-frames-bg-color': 'hsl(180deg 75% 50% / 8%)',
                    '--arwes-frames-line-color': 'hsl(180deg 75% 50%)',
                    '--arwes-frames-deco-color': 'hsl(180deg 75% 50% / 65%)'
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
              <div className="relative w-full h-[350px]">
                <Animator active={active} duration={{ enter: 2.5, exit: 2.0 }}>
                  <FrameGateOmniTerminal />
                </Animator>
              </div>
              <div className="relative w-full h-[350px]">
                <Animator active={active} duration={{ enter: 3.0, exit: 2.5 }}>
                  <FrameGateOmniTerminalAssembler />
                </Animator>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
              <div className="relative w-full h-[350px]">
                <FrameGateOmniTerminalAssemblerEnterOnly />
              </div>
              <div className="relative w-full h-[350px]">
                {/* Placeholder untuk comparison */}
              </div>
            </div>
          </div>
        </AnimatorGeneralProvider>
      </div>
    </div>
  )
}

export default PageTestFrame
