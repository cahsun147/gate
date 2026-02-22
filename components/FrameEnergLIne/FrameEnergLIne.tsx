'use client'

import { memo, useRef, type CSSProperties } from 'react'
import { FrameBase, useFrameAssembler, type FrameSettings } from '@arwes/react'

const frameSettings: FrameSettings = {
  elements: [
    {
      type: 'path',
      name: 'bg',
      style: {
        fill: 'rgba(8, 24, 24, 0.9)',
        stroke: 'rgba(32, 223, 223, 0.2)',
        strokeWidth: '1'
      },
      path: [
        ['M', 40, 0],
        ['H', '100% - 40'],
        ['l', 40, 40],
        ['V', '50% - 30'],
        ['l', -15, 15],
        ['v', 30],
        ['l', 15, 15],
        ['V', '100% - 40'],
        ['l', -40, 40],
        ['H', 40],
        ['l', -40, -40],
        ['V', '50% + 30'],
        ['l', 15, -15],
        ['v', -30],
        ['l', -15, -15],
        ['V', 40],
        ['l', 40, -40], 'Z'
      ]
    },
    {
      type: 'path',
      name: 'line',
      style: { stroke: '#20dfdf', strokeWidth: '2', fill: 'none' },
      path: [
        ['M', '100% - 15', '50% - 15'],
        ['v', 30],
        ['M', 15, '50% - 15'],
        ['v', 30]
      ]
    },
    {
      type: 'path',
      name: 'line',
      style: { stroke: '#20dfdf', strokeWidth: '1', fill: 'none', opacity: 0.5 },
      path: [
        ['M', 15, '50% - 15'],
        ['l', 15, -15],
        ['V', 40],
        ['l', 10, -10]
      ]
    },
    {
      type: 'path',
      name: 'line',
      style: { stroke: '#20dfdf', strokeWidth: '1', fill: 'none', opacity: 0.5 },
      path: [
        ['M', '100% - 15', '50% - 15'],
        ['l', -15, -15],
        ['V', 40],
        ['l', -10, -10]
      ]
    },
    {
      type: 'path',
      name: 'deco',
      style: { fill: '#20dfdf' },
      path: [
        ['M', '50% - 20', 5],
        ['h', 40],
        ['v', 2],
        ['h', -40], 'Z',
        ['M', '50% - 10', '100% - 7'],
        ['h', 20],
        ['v', 2],
        ['h', -20], 'Z'
      ]
    },
    {
      type: 'rect',
      name: 'deco',
      style: { fill: '#20dfdf' },
      x: '100% - 35',
      y: 15,
      width: 4,
      height: 4
    },
    {
      type: 'rect',
      name: 'deco',
      style: { fill: '#20dfdf' },
      x: 31,
      y: '100% - 19',
      width: 4,
      height: 4
    }
  ]
}

export type FrameEnergLIneProps = {
  className?: string
  style?: CSSProperties
}

const FrameEnergLIne = memo((props: FrameEnergLIneProps): JSX.Element => {
  const { className, style } = props

  const elementRef = useRef<HTMLDivElement>(null)
  useFrameAssembler(elementRef)

  return (
    <div ref={elementRef} className={className} style={{ position: 'absolute', inset: 0, ...style }}>
      <FrameBase settings={frameSettings} />
    </div>
  )
})

FrameEnergLIne.displayName = 'FrameEnergLIne'

export { FrameEnergLIne }
