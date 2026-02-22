'use client'

import { memo, useRef, type CSSProperties } from 'react'
import { FrameBase, useFrameAssembler, type FrameSettings } from '@arwes/react'

const frameSettings: FrameSettings = {
  elements: [
    {
      type: 'path',
      name: 'bg',
      style: {
        fill: 'rgba(8, 24, 24, 0.8)',
        stroke: 'rgba(32, 223, 223, 0.25)',
        strokeWidth: '1'
      },
      path: [
        ['M', 24, 0.5],
        ['H', '100% - 24'],
        ['l', 24, 24],
        ['V', '100% - 24'],
        ['l', -24, 24],
        ['H', 24],
        ['l', -24, -24],
        ['V', 24],
        ['l', 24, -24],
        'Z'
      ]
    },
    {
      type: 'path',
      name: 'line',
      style: {
        stroke: '#20dfdf',
        strokeWidth: '2',
        fill: 'none'
      },
      path: [
        ['M', 12, 0.5],
        ['H', '100% - 12'],
        ['M', '100% - 0.5', 12],
        ['V', '100% - 12'],
        ['M', 12, '100% - 0.5'],
        ['H', '100% - 12'],
        ['M', 0.5, 12],
        ['V', '100% - 12']
      ]
    },
    {
      type: 'path',
      name: 'line',
      style: {
        stroke: '#20dfdf',
        strokeWidth: '1',
        fill: 'none',
        opacity: 0.5
      },
      path: [
        ['M', 24, 0.5],
        ['h', 18],
        ['M', '100% - 42', 0.5],
        ['h', 18],
        ['M', 24, '100% - 0.5'],
        ['h', 18],
        ['M', '100% - 42', '100% - 0.5'],
        ['h', 18]
      ]
    },
    {
      type: 'rect',
      name: 'deco',
      style: {
        fill: '#20dfdf',
        opacity: 0.9
      },
      x: 16,
      y: 16,
      width: 3,
      height: 3
    },
    {
      type: 'rect',
      name: 'deco',
      style: {
        fill: '#20dfdf',
        opacity: 0.9
      },
      x: '100% - 19',
      y: 16,
      width: 3,
      height: 3
    },
    {
      type: 'rect',
      name: 'deco',
      style: {
        fill: '#20dfdf',
        opacity: 0.9
      },
      x: 16,
      y: '100% - 19',
      width: 3,
      height: 3
    },
    {
      type: 'rect',
      name: 'deco',
      style: {
        fill: '#20dfdf',
        opacity: 0.9
      },
      x: '100% - 19',
      y: '100% - 19',
      width: 3,
      height: 3
    }
  ]
}

export type FrameXGateProps = {
  className?: string
  style?: CSSProperties
}

const FrameXGate = memo((props: FrameXGateProps): JSX.Element => {
  const { className, style } = props

  const elementRef = useRef<HTMLDivElement>(null)
  useFrameAssembler(elementRef)

  return (
    <div ref={elementRef} className={className} style={{ position: 'absolute', inset: 0, ...style }}>
      <FrameBase {...({ settings: frameSettings, animated: false } as any)} />
    </div>
  )
})

FrameXGate.displayName = 'FrameXGate'

export { FrameXGate }
