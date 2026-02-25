'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { 
  Animator,
  AnimatorGeneralProvider,
  Animated,
  FrameBase,
  type FrameSettings
} from '@arwes/react'

import {
  FrameEnergLIne,
  FrameGateFolderTabAssembler,
  FrameGateFolderTabGlassAssembler,
  FrameXGate,
  GateOmniTerminal,
  GateOmniTerminalAssembler
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

        <AnimatorGeneralProvider disabled={false} dismissed={false} duration={{ enter: 1.5, exit: 1.5 }}>
          <Animator root active={active}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative h-[240px] overflow-hidden">
                <FrameEnergLIne />
              </div>

              <div className="relative h-[240px] overflow-hidden">
                <FrameXGate />
              </div>

              <div className="relative h-[240px] overflow-hidden md:col-span-2">
                <FrameGateFolderTabAssembler />
              </div>

              <div className="relative h-[240px] overflow-hidden md:col-span-2">
                <FrameGateFolderTabGlassAssembler />
              </div>

              <div className="relative h-[350px] overflow-hidden md:col-span-2">
                <GateOmniTerminal />
              </div>

              <div className="relative h-[350px] overflow-hidden md:col-span-2">
                <GateOmniTerminalAssembler />
              </div>
            </div>
          </Animator>
        </AnimatorGeneralProvider>
      </div>
    </div>
  )
}

export default PageTestFrame
