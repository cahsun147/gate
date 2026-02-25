'use client'

import { memo, useRef, type CSSProperties } from 'react'
import { Animator, FrameBase, useFrameAssembler, type FrameSettings } from '@arwes/react'

const omniFrameSettings: FrameSettings = {
  elements: [
    // 1. BASE LAYER: Latar belakang dengan sudut "Stealth"
    {
      type: 'path',
      name: 'bg',
      style: { 
        fill: 'rgba(10, 30, 30, 0.9)', 
        stroke: 'rgba(32, 223, 223, 0.1)',
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
      style: { stroke: '#20dfdf', strokeWidth: '3', fill: 'none' },
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
      style: { stroke: '#20dfdf', strokeWidth: '0.5', opacity: 0.6, fill: 'none' },
      path: [
        ['M', 50, 10], ['H', '100% - 50'],
        ['M', 50, '100% - 10'], ['H', '100% - 50'],
        ['M', 10, 50], ['V', '100% - 50'],
        ['M', '100% - 10', 50], ['V', '100% - 50']
      ]
    },
    // 4. DATA PORTS: Aksen visual fungsional di sisi samping
    ...[0, 1].map(i => ({
      type: 'rect' as const,
      name: 'deco',
      style: { fill: '#20dfdf' },
      x: i === 0 ? 5 : '100% - 8',
      y: '50% - 15',
      width: 3,
      height: 30
    })),
    // 5. TOP ID TAG: Area kecil untuk label atau judul
    {
      type: 'path',
      name: 'deco',
      style: { fill: 'rgba(32, 223, 223, 0.2)', stroke: '#20dfdf', strokeWidth: '1' },
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
}

const GateOmniTerminal = memo((props: GateOmniTerminalProps): JSX.Element => {
  const { className, style, children } = props

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {/* Frame Utama */}
      <FrameBase settings={omniFrameSettings} />
      
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
  const { className, style, children } = props
  const elementRef = useRef<HTMLDivElement>(null)
  useFrameAssembler(elementRef)

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
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

      {/* Animated Frame */}
      <div ref={elementRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <FrameBase settings={omniFrameSettings} />
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

export {
  GateOmniTerminal,
  GateOmniTerminalAssembler
}
