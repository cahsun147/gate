import React, { type ReactElement } from 'react'
import { type AnimatedProp, memo, Animated, cx } from '@arwes/react'
import Image from 'next/image'

interface XgateLogoTypeProps {
  className?: string
  animated?: AnimatedProp
}

const XgateLogoType = memo((props: XgateLogoTypeProps): ReactElement => {
  const { className, animated } = props
  return (
    <Animated
      as="div"
      className={cx('select-none inline-block', className)}
      style={{
        filter: 'drop-shadow(0 0 8px hsla(180, 100%, 70%, 0.5))'
      }}
      animated={animated}
    >
      <Image
        src="/images/logotype.svg"
        alt="Xgate Logo"
        width={28}
        height={1}
        priority
        style={{
          width: '100%',
          height: 'auto'
        }}
      />
    </Animated>
  )
})

export { XgateLogoType }
