'use client'

import { memo, useRef, type CSSProperties } from 'react'
import { Animator, FrameBase, useFrameAssembler, type FrameSettings } from '@arwes/react'

import { getFrameStyleVarsFromDefaults, mergeFrameStyleVars, type FrameStyleVars } from '@/config'

const defaults = {
  line: {
    color: '#20dfdf'
  },
  bg: {
    color: 'rgba(8, 24, 24, 0.9)',
    stroke: 'rgba(32, 223, 223, 0.2)',
    filter: 'drop-shadow(0 0 2px rgba(32, 223, 223, 0.15))'
  },
  deco: {
    color: '#20dfdf'
  }
}

const frameSettings: FrameSettings = {
  elements: [
    {
      type: 'path',
      name: 'bg',
      style: {
        fill: 'var(--arwes-frames-bg-color, rgba(8, 24, 24, 0.9))',
        stroke: 'var(--arwes-frames-bg-stroke, rgba(32, 223, 223, 0.2))',
        strokeWidth: '1'
      },
      path: [
        ['M', 40, 0],
        ['H', 'calc(100% - 40px)'],
        ['l', 40, 40],
        ['V', 'calc(50% - 30px)'],
        ['l', -15, 15],
        ['v', 30],
        ['l', 15, 15],
        ['V', 'calc(100% - 40px)'],
        ['l', -40, 40],
        ['H', 40],
        ['l', -40, -40],
        ['V', 'calc(50% + 30px)'],
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
      style: {
        stroke: 'var(--arwes-frames-line-color, #20dfdf)',
        strokeWidth: '2',
        fill: 'none',
        filter: 'var(--arwes-frames-line-filter, none)'
      },
      path: [
        ['M', 'calc(100% - 15px)', 'calc(50% - 15px)'],
        ['v', 30],
        ['M', 15, 'calc(50% - 15px)'],
        ['v', 30]
      ]
    },
    {
      type: 'path',
      name: 'line',
      style: {
        stroke: 'var(--arwes-frames-line-color, #20dfdf)',
        strokeWidth: '1',
        fill: 'none',
        opacity: 0.5,
        filter: 'var(--arwes-frames-line-filter, none)'
      },
      path: [
        ['M', 15, 'calc(50% - 15px)'],
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
        ['M', 'calc(100% - 15px)', 'calc(50% - 15px)'],
        ['l', -15, -15],
        ['V', 40],
        ['l', -10, -10]
      ]
    },
    {
      type: 'path',
      name: 'deco',
      style: { fill: 'var(--arwes-frames-deco-color, #20dfdf)', filter: 'var(--arwes-frames-deco-filter, none)' },
      path: [
        ['M', 'calc(50% - 20px)', 5],
        ['h', 40],
        ['v', 2],
        ['h', -40], 'Z',
        ['M', 'calc(50% - 10px)', 'calc(100% - 7px)'],
        ['h', 20],
        ['v', 2],
        ['h', -20], 'Z'
      ]
    },
    {
      type: 'rect',
      name: 'deco',
      style: { fill: 'var(--arwes-frames-deco-color, #20dfdf)', filter: 'var(--arwes-frames-deco-filter, none)' },
      x: 'calc(100% - 35px)',
      y: 15,
      width: 4,
      height: 4
    },
    {
      type: 'rect',
      name: 'deco',
      style: { fill: 'var(--arwes-frames-deco-color, #20dfdf)', filter: 'var(--arwes-frames-deco-filter, none)' },
      x: 31,
      y: 'calc(100% - 19px)',
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

FrameEnergLIne.displayName = 'FrameEnergLIne'

export { FrameEnergLIne }
