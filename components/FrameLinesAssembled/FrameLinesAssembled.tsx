'use client'

import { memo, useRef, type CSSProperties } from 'react'
import { FrameLines, useFrameAssembler } from '@arwes/react'

export type FrameLinesAssembledProps = {
  className?: string
  style?: CSSProperties
  largeLineWidth?: number
  smallLineWidth?: number
  smallLineLength?: number
  padding?: number
}

const FrameLinesAssembled = memo((props: FrameLinesAssembledProps): JSX.Element => {
  const { className, style, largeLineWidth, smallLineWidth, smallLineLength, padding } = props

  const frameRef = useRef<SVGSVGElement>(null)
  useFrameAssembler(frameRef)

  return (
    <FrameLines
      elementRef={frameRef}
      className={className}
      style={style}
      largeLineWidth={largeLineWidth}
      smallLineWidth={smallLineWidth}
      smallLineLength={smallLineLength}
      padding={padding}
      styled={false}
      animated={false}
    />
  )
})

FrameLinesAssembled.displayName = 'FrameLinesAssembled'

export { FrameLinesAssembled }
