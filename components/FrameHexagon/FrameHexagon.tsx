'use client'

import { memo, useRef, type CSSProperties } from 'react'
import {
  Animator,
  FrameBase,
  useFrameAssembler,
  type FrameSettings,
  type FrameSettingsPathDefinition
} from '@arwes/react'

import { getFrameStyleVarsFromDefaults, mergeFrameStyleVars, type FrameStyleVars } from '@/config'

const defaults = {
  line: {
    color: '#20dfdf',
    filter: 'drop-shadow(0 0 2px rgba(32, 223, 223, 0.35))'
  },
  bg: {
    color: 'rgba(8, 24, 24, 0.8)',
    stroke: 'rgba(32, 223, 223, 0.25)',
    filter: 'none'
  },
  deco: {
    color: '#20dfdf',
    filter: 'none'
  }
  
}

// Based on public/hexagon.svg (viewBox 0 0 87 100)
const hexagonPath: FrameSettingsPathDefinition = [
  ['M', '99%', 25.288],
  ['V', '75%'],
  ['L', '50%', '99%'],
  ['L', '1%', '75%'],
  ['V', 25.288],
  ['L', '50%', 0.576],
  ['L', '99%', 25.288, 'Z']
]

const frameSettings: FrameSettings = {
  elements: [
    {
      type: 'path',
      name: 'bg',
      style: {
        fill: 'var(--arwes-frames-bg-color, rgba(8, 24, 24, 0.8))',
        stroke: 'var(--arwes-frames-bg-stroke, rgba(32, 223, 223, 0.25))',
        strokeWidth: '1',
        filter: 'var(--arwes-frames-bg-filter, none)'
      },
      path: hexagonPath
    },
    {
      type: 'path',
      name: 'line',
      style: {
        stroke: 'var(--arwes-frames-line-color, #20dfdf)',
        strokeWidth: '2',
        fill: 'none',
        filter: 'var(--arwes-frames-line-filter, none)'
      },
      path: hexagonPath
    },
    {
      type: 'rect',
      name: 'deco',
      style: {
        fill: 'var(--arwes-frames-deco-color, #20dfdf)',
        filter: 'var(--arwes-frames-deco-filter, none)',
        opacity: 0.9
      },
      x: 'calc(50% - 1.5px)',
      y: 8,
      width: 3,
      height: 3
    }
  ]
}

export type FrameHexagonProps = {
  className?: string
  style?: CSSProperties
}

const FrameHexagon = memo((props: FrameHexagonProps): JSX.Element => {
  const { className, style } = props

  const styleFrameVars = mergeFrameStyleVars(
    getFrameStyleVarsFromDefaults(defaults),
    style as unknown as FrameStyleVars
  )

  const elementRef = useRef<HTMLDivElement>(null)
  useFrameAssembler(elementRef)

  return (
    <Animator duration={{ enter: 1.5, exit: 1.5 }}>
      <div
        ref={elementRef}
        className={className}
        style={{ position: 'absolute', inset: 0, ...(styleFrameVars as any), ...style }}
      >
        <FrameBase {...({ settings: frameSettings, animated: false } as any)} />
      </div>
    </Animator>
  )
})

FrameHexagon.displayName = 'FrameHexagon'

export { FrameHexagon }
