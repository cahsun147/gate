'use client'

import { memo, useRef, type CSSProperties } from 'react'
import { Animator, FrameBase, useFrameAssembler, type FrameSettings } from '@arwes/react'

const omniFrameSettings: FrameSettings = {
  elements: [
    // 1. BACKGROUND: Latar belakang utama
    {
      type: 'path',
      name: 'bg',
      style: { 
        fill: 'var(--arwes-frames-bg-color, rgba(10, 30, 30, 0.9))', 
        stroke: 'var(--arwes-frames-line-color, rgba(32, 223, 223, 0.1))',
        strokeWidth: '1' 
      },
      path: [
        ['M', 40, 0], 
        ['H', '100% - 40'], ['l', 40, 40], 
        ['V', '100% - 40'], ['l', -40, 40], 
        ['H', 40], ['l', -40, -40], 
        ['V', 40]
      ]
    },
    // 2. PRIMARY BRACKETS: Penyangga sudut yang tebal
    {
      type: 'path',
      name: 'line',
      style: { 
        stroke: 'var(--arwes-frames-line-color, #20dfdf)', 
        strokeWidth: '3', 
        fill: 'none' 
      },
      path: [
        // Pojok Kiri Atas
        ['M', 0, 60], ['V', 40], ['l', 40, -40], ['H', 60],
        // Pojok Kanan Bawah
        ['M', '100%', '100% - 60'], ['V', '100% - 40'], 
        ['l', -40, 40], ['H', '100% - 60']
      ]
    },
    // 3. SECONDARY BORDER: Garis halus yang membingkai area teks
    {
      type: 'path',
      name: 'line',
      style: { 
        stroke: 'var(--arwes-frames-line-color, rgba(32, 223, 223, 0.3))', 
        strokeWidth: '1', 
        fill: 'none' 
      },
      path: [
        // Border dalam
        ['M', 50, 50], ['H', '100% - 50'], 
        ['V', '100% - 50'], ['H', 50], ['V', 50]
      ]
    },
    // 4. DATA PORTS: Konektor data di kiri dan kanan
    {
      type: 'rect',
      name: 'deco',
      style: { fill: 'var(--arwes-frames-line-color, #20dfdf)' },
      x: 5,
      y: '50% - 15',
      width: 3,
      height: 30
    },
    {
      type: 'rect',
      name: 'deco',
      style: { fill: 'var(--arwes-frames-line-color, #20dfdf)' },
      x: '100% - 8',
      y: '50% - 15',
      width: 3,
      height: 30
    },
    // 5. TOP TAG: Label identifikasi di bagian atas
    {
      type: 'path',
      name: 'deco',
      style: { 
        fill: 'rgba(32, 223, 223, 0.2)', 
        stroke: 'var(--arwes-frames-line-color, #20dfdf)', 
        strokeWidth: '1' 
      },
      path: [
        ['M', '50% - 60', 0], ['H', '50% + 60'], 
        ['v', 15], ['l', -10, 10], ['H', '50% - 50'], 
        ['l', -10, -10]
      ]
    },
    // 6. DATA PORTS: Aksen visual fungsional di sisi samping
    ...[0, 1].map(i => ({
      type: 'rect' as const,
      name: 'deco',
      style: { fill: 'var(--arwes-frames-line-color, #20dfdf)' },
      x: i === 0 ? 5 : '100% - 8',
      y: '50% - 15',
      width: 3,
      height: 30
    })),
    // 7. TOP ID TAG: Area kecil untuk label atau judul
    {
      type: 'path',
      name: 'deco',
      style: { 
        fill: 'var(--arwes-frames-tag-color, rgba(32, 223, 223, 0.2))', 
        stroke: 'var(--arwes-frames-line-color, #20dfdf)', 
        strokeWidth: '1' 
      },
      path: [
        ['M', '50% - 60', 0], ['H', '50% + 60'], 
        ['v', 15], ['l', -10, 10], ['H', '50% - 50'], 
        ['l', -10, -10]
      ]
    }
  ]
}

export type GateOmniTerminalProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
  frameSettings?: Partial<FrameSettings>
}

const GateOmniTerminal = memo((props: GateOmniTerminalProps): JSX.Element => {
  const { className, style, children, frameSettings } = props

  const mergedFrameSettings = {
    ...omniFrameSettings,
    ...frameSettings,
    elements: [
      ...omniFrameSettings.elements.slice(0, 3),
      ...omniFrameSettings.elements.slice(3).map(element => ({
        ...element,
        ...frameSettings?.elements?.find(e => e.name === element.name)
      }))
    ]
  } as FrameSettings

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, ...style }}>
      {/* Frame Utama */}
      <FrameBase settings={mergedFrameSettings} />
      
      {/* Layer Konten */}
      <div style={{ 
        position: 'relative', 
        padding: '50px 40px', 
        color: '#20dfdf', 
        fontFamily: 'monospace' 
      }}>
        {/* Label di bagian atas */}
        <div style={{ 
          position: 'absolute', top: '1px', left: '50%', transform: 'translateX(-50%)',
          fontSize: '9px', fontWeight: 'bold', letterSpacing: '2px'
        }}>
          XGATE.FUN
        </div>

        {children}
      </div>
    </div>
  )
})

GateOmniTerminal.displayName = 'GateOmniTerminal'

const GateOmniTerminalAssembler = memo((props: GateOmniTerminalProps): JSX.Element => {
  const { className, style, children, frameSettings } = props
  const elementRef = useRef<HTMLDivElement>(null)
  useFrameAssembler(elementRef)

  const mergedFrameSettings = {
    ...omniFrameSettings,
    ...frameSettings,
    elements: [
      // Background dan border TANPA animasi
      ...omniFrameSettings.elements.slice(0, 3),
      // HANYA data ports yang berkedip
      ...[0, 1].map(i => ({
        type: 'rect' as const,
        name: 'deco',
        className: 'blink-anim',
        style: { fill: '#20dfdf' },
        x: i === 0 ? 5 : '100% - 8',
        y: '50% - 15',
        width: 3,
        height: 30
      })),
      // Top tag yang berkedip
      {
        type: 'path' as const,
        name: 'deco',
        className: 'blink-anim',
        style: { fill: 'rgba(32, 223, 223, 0.2)', stroke: '#20dfdf', strokeWidth: '1' },
        path: [
          ['M', '50% - 60', 0], ['H', '50% + 60'], 
          ['v', 15], ['l', -10, 10], ['H', '50% - 50'], 
          ['l', -10, -10]
        ]
      }
    ]
  } as FrameSettings

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, ...style }}>
      {/* CSS KEYFRAMES UNTUK BERKEDIP */}
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

      {/* Animated Frame - HANYA DECO YANG BERKEDIP */}
      <div ref={elementRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <FrameBase settings={mergedFrameSettings} />
      </div>
      
      {/* Layer Konten */}
      <div style={{ 
        position: 'relative', 
        padding: '50px 40px', 
        color: '#20dfdf', 
        fontFamily: 'monospace',
        zIndex: 1 
      }}>
        {/* LABEL ATAS DENGAN CLASS ANIMASI */}
        <div 
          className="blink-anim"
          style={{ 
            position: 'absolute', top: '1px', left: '50%', transform: 'translateX(-50%)',
            fontSize: '9px', fontWeight: 'bold', letterSpacing: '2px',
            color: '#20dfdf',
            textShadow: '0 0 2px #000'
          }}
        >
          GATE AI TERMINAL
        </div>

        {children}
      </div>
    </div>
  )
})

GateOmniTerminalAssembler.displayName = 'GateOmniTerminalAssembler'

const GateOmniTerminalAssemblerEnterOnly = memo((props: GateOmniTerminalProps): JSX.Element => {
  const { className, style, children, frameSettings } = props
  const elementRef = useRef<HTMLDivElement>(null)
  useFrameAssembler(elementRef)

  const mergedFrameSettings = {
    ...omniFrameSettings,
    ...frameSettings,
    elements: [
      // Background dan border TANPA animasi
      ...omniFrameSettings.elements.slice(0, 3),
      // HANYA data ports yang berkedip
      ...[0, 1].map(i => ({
        type: 'rect' as const,
        name: 'deco',
        className: 'blink-anim',
        style: { fill: '#20dfdf' },
        x: i === 0 ? 5 : '100% - 8',
        y: '50% - 15',
        width: 3,
        height: 30
      })),
      // Top tag yang berkedip
      {
        type: 'path' as const,
        name: 'deco',
        className: 'blink-anim',
        style: { fill: 'rgba(32, 223, 223, 0.2)', stroke: '#20dfdf', strokeWidth: '1' },
        path: [
          ['M', '50% - 60', 0], ['H', '50% + 60'], 
          ['v', 15], ['l', -10, 10], ['H', '50% - 50'], 
          ['l', -10, -10]
        ]
      }
    ]
  } as FrameSettings

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, ...style }}>
      {/* CSS KEYFRAMES UNTUK BERKEDIP */}
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

      {/* Animated Frame - HANYA DECO YANG BERKEDIP */}
      <div ref={elementRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <FrameBase settings={mergedFrameSettings} />
      </div>
      
      {/* Layer Konten */}
      <div style={{ 
        position: 'relative', 
        padding: '50px 40px', 
        color: '#20dfdf', 
        fontFamily: 'monospace',
        zIndex: 1 
      }}>
        {/* LABEL ATAS DENGAN CLASS ANIMASI */}
        <div 
          className="blink-anim"
          style={{ 
            position: 'absolute', top: '1px', left: '50%', transform: 'translateX(-50%)',
            fontSize: '9px', fontWeight: 'bold', letterSpacing: '2px',
            color: '#20dfdf',
            textShadow: '0 0 2px #000'
          }}
        >
          GATE AI TERMINAL
        </div>

        {children}
      </div>
    </div>
  )
})

GateOmniTerminalAssemblerEnterOnly.displayName = 'GateOmniTerminalAssemblerEnterOnly'

export {
  GateOmniTerminal,
  GateOmniTerminalAssembler,
  GateOmniTerminalAssemblerEnterOnly
}
