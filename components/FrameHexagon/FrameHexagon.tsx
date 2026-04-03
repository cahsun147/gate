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

// Path Segienam tanpa Z
const hexagonPath: FrameSettingsPathDefinition = [
  ['M', '100%', '25%'], // Kanan Atas
  ['V', '75%'],         // Turun ke Kanan Bawah
  ['L', '50%', '100%'], // Titik Bawah Tengah
  ['L', 0, '75%'],      // Kiri Bawah
  ['V', '25%'],         // Naik ke Kiri Atas
  ['L', '50%', 0],      // Titik Atas Tengah
  ['L', '100%', '25%']  // Tutup path kembali ke titik awal
]

const frameSettings: FrameSettings = {
  elements: [
    // 1. BACKGROUND FILL
    {
      type: 'path',
      name: 'bg',
      style: {
        fill: 'var(--arwes-frames-bg-color, rgba(8, 24, 24, 0.8))',
        stroke: 'var(--arwes-frames-bg-stroke, rgba(32, 223, 223, 0.25))',
        strokeWidth: '1',
        opacity: 0.1,
        filter: 'var(--arwes-frames-bg-filter, none)'
      },
      path: hexagonPath
    },
    // 2. MAIN STROKE
    {
      type: 'path',
      name: 'line',
      style: {
        stroke: 'var(--arwes-frames-line-color, #20dfdf)',
        strokeWidth: '2',
        fill: 'none',
        filter: 'var(--arwes-frames-line-filter, drop-shadow(0 0 2px rgba(32, 223, 223, 0.35)))'
      },
      path: hexagonPath
    },
    // 3. DEKORASI (Bracket kecil di tengah)
    {
      type: 'path',
      name: 'deco',
      style: {
        stroke: 'var(--arwes-frames-deco-color, #20dfdf)',
        strokeWidth: '2',
        fill: 'none',
        filter: 'var(--arwes-frames-deco-filter, none)'
      },
      path: [
        ['M', 5, '45%'], 
        ['V', '55%'],
        ['M', '100% - 5', '45%'],
        ['V', '55%']
      ]
    }
  ]
}

export type FrameHexagonProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}

const FrameHexagon = memo((props: FrameHexagonProps): JSX.Element => {
  const { className, style, children } = props

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
        
        {children && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: 'monospace',
              color: 'var(--arwes-frames-line-color, #ffaa00)',
              textShadow: '0 0 5px var(--arwes-frames-line-color, #ffaa00)',
              zIndex: 1
            }}
          >
            {children}
          </div>
        )}
      </div>
    </Animator>
  )
})

FrameHexagon.displayName = 'FrameHexagon'

export { FrameHexagon }