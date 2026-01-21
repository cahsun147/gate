'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { Text as ArwesText, type TextProps } from '@arwes/react'

type BaseTextProps = TextProps & {
  children?: ReactNode
}

const BaseText = (props: BaseTextProps): JSX.Element => {
  return <ArwesText {...props} />
}

type UpdateTextProps = Omit<BaseTextProps, 'children'> & {
  childrenList: ReactNode[]
  intervalMs?: number
  loop?: boolean
  initialIndex?: number
}

const Update = (props: UpdateTextProps): JSX.Element => {
  const { childrenList, intervalMs = 2000, loop = true, initialIndex = 0, ...rest } = props

  const safeInitialIndex = Math.min(Math.max(0, initialIndex), Math.max(0, childrenList.length - 1))
  const [childrenIndex, setChildrenIndex] = useState(safeInitialIndex)

  useEffect(() => {
    if (!childrenList.length) return

    const timeout = setTimeout(() => {
      const isLastIndex = childrenIndex === childrenList.length - 1
      const nextIndex = isLastIndex ? (loop ? 0 : childrenIndex) : childrenIndex + 1
      setChildrenIndex(nextIndex)
    }, intervalMs)

    return () => clearTimeout(timeout)
  }, [childrenIndex, childrenList, intervalMs, loop])

  return <ArwesText {...rest}>{childrenList[childrenIndex]}</ArwesText>
}

type BlinkTextProps = BaseTextProps & {
  blinkDuration?: number
}

const Blink = ({ blinkDuration = 0.5, ...props }: BlinkTextProps): JSX.Element => {
  return <ArwesText {...props} blink blinkDuration={blinkDuration} />
}

const Sequence = (props: BaseTextProps): JSX.Element => {
  return <ArwesText {...props} manager="sequence" />
}

const Decipher = (props: BaseTextProps): JSX.Element => {
  return <ArwesText {...props} manager="decipher" />
}

const Text = Object.assign(BaseText, {
  Update,
  Blink,
  Sequence,
  Decipher
})

export { Text }
export type { BaseTextProps, UpdateTextProps, BlinkTextProps }
