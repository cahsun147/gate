'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Animated, FrameCorners, Illuminator, cx, useBleeps } from '@arwes/react'

import { type BleepNames, theme } from '@/config'

type LoginButtonProps = {
  className?: string
}

export function LoginButton(props: LoginButtonProps): JSX.Element {
  const { className } = props
  const { ready, authenticated, login, user, logout } = usePrivy()
  const bleeps = useBleeps<BleepNames>()

  // 1. Loading State (tunggu Privy siap)
  const label = !ready
    ? 'INITIALIZING'
    : authenticated && user
      ? user.wallet?.address
        ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
        : user.email?.address ?? 'ACCOUNT'
      : 'CONNECT'

  const title = !ready ? 'Initializing...' : authenticated ? 'Logout' : 'Login'

  return (
    <Animated<HTMLButtonElement>
      as="button"
      type="button"
      disabled={!ready}
      title={title}
      className={cx(
        'relative group flex items-center justify-center select-none',
        'h-10 md:h-12',
        'px-4',
        'uppercase font-cta text-size-11 md:text-size-10',
        'transition-[color] ease-out duration-200',
        !ready && 'cursor-not-allowed opacity-60',
        ready && 'cursor-pointer',
        authenticated ? 'text-secondary-main-3 hover:text-secondary-high-2' : 'text-primary-main-5 hover:text-primary-high-2',
        className
      )}
      animated={['flicker']}
      onMouseEnter={() => {
        bleeps.hover?.play()
      }}
      onClick={() => {
        if (!ready) {
          return
        }
        if (authenticated) {
          logout()
        } else {
          login()
        }
        bleeps.click?.play()
      }}
    >
      <FrameCorners
        className="opacity-30 transition-opacity ease-out duration-200 group-hover:opacity-70"
        style={{
          filter: `drop-shadow(0 0 ${theme.space(2)} ${theme.colors.secondary.main(3)})`,
          // @ts-expect-error css variables
          '--arwes-frames-bg-color': 'transparent',
          '--arwes-frames-line-color': 'currentcolor',
          '--arwes-frames-deco-color': 'currentcolor'
        }}
        animated={false}
        cornerLength={theme.spacen(2)}
      />

      <Illuminator
        style={{
          inset: theme.space(0.5),
          width: `calc(100% - ${theme.space(1)})`,
          height: `calc(100% - ${theme.space(1)})`
        }}
        size={theme.spacen(60)}
        color={theme.colors.secondary.main(3, { alpha: 0.12 })}
      />

      <span className={cx('relative flex items-center justify-center', authenticated && 'normal-case font-mono')}>
        {label}
      </span>
    </Animated>
  )
}