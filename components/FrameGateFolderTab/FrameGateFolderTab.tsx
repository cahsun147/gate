'use client'

import { memo, useMemo, useRef, type CSSProperties } from 'react'
import { FrameBase, useFrameAssembler, type FrameSettings } from '@arwes/react'

const folderTabPathArwes: NonNullable<FrameSettings['elements']>[number] extends { path: infer P }
  ? P
  : any = [
  ['M', 25.5, 1.5],
  ['H', 226.5],
  ['C', 234.78, 1.5, 241.5, 8.21, 241.5, 16.5],
  ['C', 241.5, 24.78, 248.21, 31.5, 256.5, 31.5],
  ['H', '100% - 25.5'],
  ['Q', '100% - 1.5', 31.5, '100% - 1.5', 55.5],
  ['V', '100% - 25.5'],
  ['Q', '100% - 1.5', '100% - 1.5', '100% - 25.5', '100% - 1.5'],
  ['H', 25.5],
  ['Q', 1.5, '100% - 1.5', 1.5, '100% - 25.5'],
  ['V', 25.5],
  ['Q', 1.5, 1.5, 25.5, 1.5]
]

const frameSettings: FrameSettings = {
  elements: [
    {
      type: 'path',
      name: 'line',
      style: {
        stroke: 'rgba(255, 255, 255, 0.8)',
        strokeWidth: '2',
        fill: 'none',
        filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))'
      },
      path: folderTabPathArwes
    }
  ]
}

const getPathString = (w: number, h: number): string => {
  return `
    M 25.5 1.5
    H 226.5
    C 234.78 1.5 241.5 8.21 241.5 16.5
    C 241.5 24.78 248.21 31.5 256.5 31.5
    H ${w - 25.5}
    Q ${w - 1.5} 31.5 ${w - 1.5} 55.5
    V ${h - 25.5}
    Q ${w - 1.5} ${h - 1.5} ${w - 25.5} ${h - 1.5}
    H 25.5
    Q 1.5 ${h - 1.5} 1.5 ${h - 25.5}
    V 25.5
    Q 1.5 1.5 25.5 1.5
  `
    .replace(/\s+/g, ' ')
    .trim()
}

export type FrameGateFolderTabProps = {
  className?: string
  style?: CSSProperties
  glass?: boolean
  glassBlur?: number
  glassBackgroundColor?: string
  glassBorderColor?: string
  glassBoxShadow?: string
}

const FrameGateFolderTab = memo((props: FrameGateFolderTabProps): JSX.Element => {
  const {
    className,
    style,
    glass = false,
    glassBlur = 10,
    glassBackgroundColor = 'rgba(255, 255, 255, 0.05)',
    glassBorderColor = 'rgba(255, 255, 255, 0.1)',
    glassBoxShadow = '0 4px 30px rgba(0, 0, 0, 0.2)'
  } = props

  const elementRef = useRef<HTMLDivElement>(null)
  useFrameAssembler(elementRef)

  const clipPath = useMemo(() => {
    const el = elementRef.current
    if (!el) return undefined
    const rect = el.getBoundingClientRect()
    const w = Math.max(1, rect.width)
    const h = Math.max(1, rect.height)
    return `path('${getPathString(w, h)}')`
  }, [])

  return (
    <div ref={elementRef} className={className} style={{ position: 'absolute', inset: 0, ...style }}>
      {glass && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundColor: glassBackgroundColor,
            backdropFilter: `blur(${glassBlur}px)`,
            WebkitBackdropFilter: `blur(${glassBlur}px)`,
            boxShadow: glassBoxShadow,
            border: `1px solid ${glassBorderColor}`,
            clipPath
          }}
        />
      )}

      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <FrameBase settings={frameSettings} />
      </div>
    </div>
  )
})

FrameGateFolderTab.displayName = 'FrameGateFolderTab'

const FrameGateFolderTabGlass = memo(
  (props: Omit<FrameGateFolderTabProps, 'glass'>): JSX.Element => {
    return <FrameGateFolderTab {...props} glass />
  }
)

FrameGateFolderTabGlass.displayName = 'FrameGateFolderTabGlass'

export { FrameGateFolderTab, FrameGateFolderTabGlass }
