'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { Animator } from '@arwes/react'

import { FrameEnergLIne, FrameGateFolderTab, FrameGateFolderTabGlass, FrameXGate } from '@/components'

const PageTestFrame = (): JSX.Element => {
  const [active, setActive] = useState(true)

  useEffect(() => {
    const tid = setTimeout(() => setActive(!active), active ? 3_000 : 1_500)
    return () => clearTimeout(tid)
  }, [active])

  return (
    <div className="flex-1 min-w-0 min-h-0 p-6 overflow-auto">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Test Frame</h1>
          <p className="text-sm opacity-70">Halaman ini untuk testing visual custom frames.</p>
        </div>

        <Animator active={active} duration={{ enter: 1, exit: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-[240px] overflow-hidden">
              <FrameEnergLIne />
            </div>

            <div className="relative h-[240px] overflow-hidden">
              <FrameXGate />
            </div>

            <div className="relative h-[240px] overflow-hidden md:col-span-2">
              <FrameGateFolderTab />
            </div>

            <div className="relative h-[240px] overflow-hidden md:col-span-2">
              <FrameGateFolderTabGlass />
            </div>
          </div>
        </Animator>
      </div>
    </div>
  )
}

export default PageTestFrame
