'use client'

import { memo, useRef, type CSSProperties } from 'react'
import { Animator, FrameBase, useFrameAssembler, type FrameSettings } from '@arwes/react'

import { getFrameStyleVarsFromDefaults, mergeFrameStyleVars, type FrameStyleVars } from '@/config'

const defaults = {
  line: {
    color: '#20dfdf',
    filter: 'drop-shadow(0 0 2px rgba(32, 223, 223, 0.35))'
  },
  bg: {
    color: 'rgba(10, 30, 30, 0.9)',
    stroke: 'rgba(32, 223, 223, 0.1)',
    filter: 'none'
  },
  deco: {
    color: '#20dfdf',
    filter: 'none'
  }
}

const omniFrameSettings: FrameSettings = {
  elements: [
    {
      type: 'path',
      name: 'bg',
      style: {
        fill: 'var(--arwes-frames-bg-color, rgba(10, 30, 30, 0.9))',
        stroke: 'var(--arwes-frames-bg-stroke, rgba(32, 223, 223, 0.1))',
        strokeWidth: '1',
        filter: 'var(--arwes-frames-bg-filter, none)'
      },
      path: [
        ['M', 40, 0],
        ['H', 'calc(100% - 40px)'],
        ['l', 40, 40],
        ['V', 'calc(100% - 40px)'],
        ['l', -40, 40],
        ['H', 40],
        ['l', -40, -40],
        ['V', 40],
        ['l', 40, -40],
        'Z'
      ]
    },
    {
      type: 'path',
      name: 'line',
      style: {
        stroke: 'var(--arwes-frames-line-color, #20dfdf)',
        strokeWidth: '3',
        fill: 'none',
        filter: 'var(--arwes-frames-line-filter, none)'
      },
      path: [
        ['M', 60, 0],
        ['H', 40],
        ['l', -40, 40],
        ['V', 60],
        ['M', 'calc(100% - 60px)', 0],
        ['H', 'calc(100% - 40px)'],
        ['l', 40, 40],
        ['V', 60],
        ['M', 0, 'calc(100% - 60px)'],
        ['V', 'calc(100% - 40px)'],
        ['l', 40, 40],
        ['H', 60],
        ['M', '100%', 'calc(100% - 60px)'],
        ['V', 'calc(100% - 40px)'],
        ['l', -40, 40],
        ['H', 'calc(100% - 60px)']
      ]
    },
    {
      type: 'rect',
      name: 'deco',
      style: {
        fill: 'var(--arwes-frames-deco-color, #20dfdf)',
        filter: 'var(--arwes-frames-deco-filter, none)'
      },
      x: 5,
      y: 'calc(50% - 15px)',
      width: 3,
      height: 30
    },
    {
      type: 'rect',
      name: 'deco',
      style: {
        fill: 'var(--arwes-frames-deco-color, #20dfdf)',
        filter: 'var(--arwes-frames-deco-filter, none)'
      },
      x: 'calc(100% - 8px)',
      y: 'calc(50% - 15px)',
      width: 3,
      height: 30
    },
    {
      type: 'path',
      name: 'deco',
      style: {
        fill: 'var(--arwes-frames-deco-color, rgba(32, 223, 223, 0.2))',
        stroke: 'var(--arwes-frames-line-color, #20dfdf)',
        strokeWidth: '1',
        filter: 'var(--arwes-frames-deco-filter, none)'
      },
      path: [
        ['M', 'calc(50% - 60px)', 0],
        ['H', 'calc(50% + 60px)'],
        ['v', 15],
        ['l', -10, 10],
        ['H', 'calc(50% - 50px)'],
        ['l', -10, -10]
      ]
    },
    ...[0, 1].map(i => ({
      type: 'rect' as const,
      name: 'deco',
      style: {
        fill: 'var(--arwes-frames-deco-color, #20dfdf)',
        filter: 'var(--arwes-frames-deco-filter, none)'
      },
      x: i === 0 ? 5 : 'calc(100% - 8px)',
      y: 'calc(50% - 15px)',
      width: 3,
      height: 30
    })),
    {
      type: 'path',
      name: 'deco',
      style: {
        fill: 'var(--arwes-frames-deco-color, rgba(32, 223, 223, 0.2))',
        stroke: 'var(--arwes-frames-line-color, #20dfdf)',
        strokeWidth: '1'
      },
      path: [
        ['M', 'calc(50% - 60px)', 0],
        ['H', 'calc(50% + 60px)'],
        ['v', 15],
        ['l', -10, 10],
        ['H', 'calc(50% - 50px)'],
        ['l', -10, -10]
      ]
    }
  ]
}

export type FrameGateOmniTerminalProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
  frameSettings?: Partial<FrameSettings>
}

const FrameGateOmniTerminal = memo((props: FrameGateOmniTerminalProps): JSX.Element => {
  const { className, style, children, frameSettings } = props

  const styleFrameVars = mergeFrameStyleVars(
    getFrameStyleVarsFromDefaults(defaults),
    style as unknown as FrameStyleVars
  )

  const mergedFrameSettings = {
    ...omniFrameSettings,
    ...frameSettings,
    elements: [
      ...omniFrameSettings.elements.slice(0, 3),
      ...omniFrameSettings.elements.slice(3).map(element => ({
        ...element,
        ...frameSettings?.elements?.find(e => e.name === (element as any).name)
      }))
    ]
  } as FrameSettings

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, ...(styleFrameVars as any), ...style }}>
      <FrameBase {...({ settings: mergedFrameSettings, animated: false } as any)} />
      <div
        style={{
          position: 'relative',
          padding: '50px 40px',
          color: 'var(--arwes-frames-line-color, #20dfdf)',
          fontFamily: 'monospace'
        }}
      >
        {children}
      </div>
    </div>
  )
})

FrameGateOmniTerminal.displayName = 'FrameGateOmniTerminal'

const FrameGateOmniTerminalAssembler = memo((props: FrameGateOmniTerminalProps): JSX.Element => {
  const { className, style, children, frameSettings } = props
  const elementRef = useRef<HTMLDivElement>(null)
  useFrameAssembler(elementRef)

  const styleFrameVars = mergeFrameStyleVars(
    getFrameStyleVarsFromDefaults(defaults),
    style as unknown as FrameStyleVars
  )

  const mergedFrameSettings = {
    ...omniFrameSettings,
    ...frameSettings,
    elements: [
      ...omniFrameSettings.elements.slice(0, 3),
      ...[0, 1].map(i => ({
        type: 'rect' as const,
        name: 'deco',
        className: 'blink-anim',
        style: { fill: 'var(--arwes-frames-deco-color, #20dfdf)' },
        x: i === 0 ? 5 : 'calc(100% - 8px)',
        y: 'calc(50% - 15px)',
        width: 3,
        height: 30
      })),
      {
        type: 'path' as const,
        name: 'deco',
        className: 'blink-anim',
        style: {
          fill: 'var(--arwes-frames-deco-color, rgba(32, 223, 223, 0.2))',
          stroke: 'var(--arwes-frames-line-color, #20dfdf)',
          strokeWidth: '1'
        },
        path: [
          ['M', 'calc(50% - 60px)', 0],
          ['H', 'calc(50% + 60px)'],
          ['v', 15],
          ['l', -10, 10],
          ['H', 'calc(50% - 50px)'],
          ['l', -10, -10]
        ]
      }
    ]
  } as FrameSettings

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, ...(styleFrameVars as any), ...style }}>
      <style>{`
        @keyframes sciFiBlink {
          0% { opacity: 1; filter: drop-shadow(0 0 5px #20dfdf); }
          50% { opacity: 0.2; filter: none; }
          100% { opacity: 1; filter: drop-shadow(0 0 5px #20dfdf); }
        }
        .blink-anim {
          animation: sciFiBlink 2s infinite ease-in-out;
        }
      `}</style>

      <div ref={elementRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <FrameBase {...({ settings: mergedFrameSettings, animated: false } as any)} />
      </div>

      <div
        style={{
          position: 'relative',
          padding: '50px 40px',
          color: 'var(--arwes-frames-line-color, #20dfdf)',
          fontFamily: 'monospace',
          zIndex: 1
        }}
      >
        {children}
      </div>
    </div>
  )
})

FrameGateOmniTerminalAssembler.displayName = 'FrameGateOmniTerminalAssembler'

const FrameGateOmniTerminalAssemblerEnterOnly = memo((props: FrameGateOmniTerminalProps): JSX.Element => {
  return (
    <Animator duration={{ enter: 1.5, exit: 1.5 }}>
      <FrameGateOmniTerminalAssembler {...props} />
    </Animator>
  )
})

FrameGateOmniTerminalAssemblerEnterOnly.displayName = 'FrameGateOmniTerminalAssemblerEnterOnly'

export {
  FrameGateOmniTerminal,
  FrameGateOmniTerminalAssembler,
  FrameGateOmniTerminalAssemblerEnterOnly
}
