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
  GateOmniTerminalAssembler,
  GateOmniTerminalAssemblerEnterOnly
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-[240px] overflow-hidden">
              <Animator active={active}>
                <FrameEnergLIne />
              </Animator>
            </div>

            <div className="relative h-[240px] overflow-hidden">
              <Animator active={active}>
                <FrameXGate />
              </Animator>
            </div>

            <div className="relative h-[240px] overflow-hidden md:col-span-2">
              <Animator active={active}>
                <FrameGateFolderTabAssembler />
              </Animator>
            </div>

            <div className="relative h-[240px] overflow-hidden md:col-span-2">
              <Animator active={active}>
                <FrameGateFolderTabGlassAssembler />
              </Animator>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
              <div className="relative w-full h-[350px]">
                <Animator active={active}>
                  <GateOmniTerminal />
                </Animator>
              </div>
              <div className="relative w-full h-[350px]">
                <Animator active={active}>
                  <GateOmniTerminalAssembler />
                </Animator>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
              <div className="relative w-full h-[350px]">
                <Animator active={active}>
                  <GateOmniTerminalAssemblerEnterOnly />
                </Animator>
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
