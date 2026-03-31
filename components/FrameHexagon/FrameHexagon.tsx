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

// Menyesuaikan warna default ke tema Oranye (Neon) dari referensi Anda
const defaults = {
  line: {
    color: '#ffaa00',
    filter: 'drop-shadow(0 0 5px #ffaa00)'
  },
  bg: {
    color: '#ffaa00',
    filter: 'none'
  },
  deco: {
    color: '#ffaa00',
    filter: 'none'
  }
}

// Path Segienam Vertikal
// Diubah menggunakan calc() agar responsif dan tidak menyebabkan error parser Arwes
const hexagonPath: FrameSettingsPathDefinition = [
  ['M', 'calc(100% - 1px)', 'calc(25%)'], // Kanan Atas
  ['V', 'calc(75%)'],                     // Turun ke Kanan Bawah
  ['L', 'calc(50%)', 'calc(100% - 1px)'], // Titik Bawah Tengah
  ['L', 1, 'calc(75%)'],                  // Kiri Bawah
  ['V', 'calc(25%)'],                     // Naik ke Kiri Atas
  ['L', 'calc(50%)', 1],                  // Titik Atas Tengah
  'Z'                                     // Tutup Path
]

const frameSettings: FrameSettings = {
  elements: [
    // 1. BACKGROUND FILL
    {
      type: 'path',
      name: 'bg',
      style: {
        fill: 'var(--arwes-frames-bg-color, #ffaa00)',
        opacity: 0.1, // Sesuai referensi fillOpacity
        strokeWidth: 0,
        filter: 'var(--arwes-frames-bg-filter, none)'
      },
      path: hexagonPath
    },
    // 2. MAIN STROKE (Garis Luar Neon)
    {
      type: 'path',
      name: 'line',
      style: {
        stroke: 'var(--arwes-frames-line-color, #ffaa00)',
        strokeWidth: '2',
        fill: 'none',
        filter: 'var(--arwes-frames-line-filter, drop-shadow(0 0 5px #ffaa00))'
      },
      path: hexagonPath
    },
    // 3. DEKORASI (Bracket kecil di tengah)
    {
      type: 'path',
      name: 'deco',
      style: {
        stroke: 'var(--arwes-frames-deco-color, #ffaa00)',
        strokeWidth: '2',
        fill: 'none',
        filter: 'var(--arwes-frames-deco-filter, none)'
      },
      path: [
        ['M', 5, 'calc(45%)'],
        ['V', 'calc(55%)'],
        ['M', 'calc(100% - 5px)', 'calc(45%)'],
        ['V', 'calc(55%)']
      ]
    }
  ]
}

export type FrameHexagonProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode // Menambahkan properti children untuk teks di dalam
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
        
        {/* Konten di Dalam Frame */}
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