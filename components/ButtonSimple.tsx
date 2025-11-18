import React, { type HTMLProps, type ReactNode } from 'react'
import {
  type AnimatedProp,
  memo,
  Animated,
  FrameCorners,
  Illuminator,
  useBleeps,
  cx
} from '@arwes/react'
import styled from '@emotion/styled'

import { type BleepNames, theme } from '@/config'

interface ButtonSimpleProps extends HTMLProps<HTMLButtonElement> {
  className?: string
  animated?: AnimatedProp
  children: ReactNode
}

const ButtonRoot = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  user-select: none;
  
  &:focus {
    outline: none;
  }
`

const ButtonContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: hsl(180, 100%, 60%);
  transition: color 0.2s ease-out;
  background: transparent;
  border: none;

  svg {
    width: 1.25em;
    height: 1.25em;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    color: hsl(180, 100%, 70%);
  }
`

const ButtonSimple = memo((props: ButtonSimpleProps): JSX.Element => {
  const { className, animated, children, ...otherProps } = props

  const bleeps = useBleeps<BleepNames>()

  return (
    <Animated<HTMLButtonElement>
      {...otherProps}
      as="button"
      className={cx(
        'relative group',
        'inline-flex items-center justify-center',
        'bg-transparent border-none p-0 m-0',
        'cursor-pointer select-none',
        'transition-colors ease-out duration-200',
        'focus:outline-none',
        className
      )}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0
      }}
      animated={animated}
      onMouseEnter={() => {
        bleeps.hover?.play()
      }}
      onClick={(event) => {
        otherProps.onClick?.(event)
        bleeps.click?.play()
      }}
    >
      <FrameCorners
        className="absolute inset-0 opacity-40 transition-opacity ease-out duration-200 group-hover:opacity-100 pointer-events-none"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.5))',
          // @ts-expect-error css variables
          '--arwes-frames-bg-color': 'transparent',
          '--arwes-frames-line-color': 'hsl(180, 100%, 60%)',
          '--arwes-frames-deco-color': 'hsl(180, 100%, 60%)'
        }}
        animated={false}
        cornerLength={8}
      />
      <Illuminator
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ease-out duration-200 pointer-events-none"
        style={{
          inset: '2px',
          width: 'calc(100% - 4px)',
          height: 'calc(100% - 4px)'
        }}
        size={60}
        color="rgba(0, 255, 255, 0.15)"
      />
      <ButtonContent
        className={cx(
          'relative z-10',
          'flex flex-row justify-center items-center gap-2',
          'px-4 py-2'
        )}
      >
        {children}
      </ButtonContent>
    </Animated>
  )
})

export { ButtonSimple }
