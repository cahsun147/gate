import { Children, type ReactNode } from 'react'
import { memo, Animator, Animated, flicker, cx, styleFrameClipOctagon } from '@arwes/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Dashboard as IconRoot,
  Page as IconDocs,
  Code as IconDocsDevelop,
  Book as IconDocsTutorial,
  Community as IconDocsCommunity,
  CollageFrame as IconTerminal,
  Codepen as IconPlay,
  DashboardSpeed as IconPerf
} from 'iconoir-react'

import { settings, theme } from '@/config'
import { IconTailwind, IconReact, IconSolid, IconSvelte } from '../icons'

type ListProps = {
  className?: string
  children: ReactNode
}

const List = (props: ListProps): JSX.Element => {
  const { className, children } = props
  return (
    <Animated as="ul" className={cx('flex flex-col w-full', className)}>
      {children}
    </Animated>
  )
}

type ItemProps = {
  href: string
  icon?: ReactNode
  text: ReactNode
  children?: ReactNode
  onLink?: () => void
}

const Item = (props: ItemProps): JSX.Element => {
  const { href, icon, text, children, onLink } = props

  const pathname = usePathname()
  const matches = pathname.startsWith(href)
  const active = pathname === href

  return (
    <li className="flex flex-col">
      <Animator>
        <Animated
          animated={flicker()}
          onTransition={(element, node) => {
            if (active && node.state === 'entered') {
              requestAnimationFrame(() => {
                element.scrollIntoView({
                  block: 'center',
                  behavior: 'smooth'
                })
              })
            }
          }}
        >
          <Link
            className={cx(
              'flex font-cta text-size-9',
              'transition-all ease-out duration-200',
              !matches && 'text-primary-main-4 hover:text-primary-high-2',
              matches && 'text-secondary-main-4 hover:text-secondary-high-2'
            )}
            href={href}
            onClick={onLink}
          >
            <div
              className={cx(
                'flex-1 flex flex-row items-center gap-2 px-4 py-2',
                active && 'bg-secondary-main-3/[0.05]'
              )}
              style={{
                clipPath: styleFrameClipOctagon({
                  leftTop: false,
                  leftBottom: false,
                  squareSize: theme.space(2)
                })
              }}
            >
              {icon}
              {text}
            </div>
          </Link>
        </Animated>
      </Animator>

      {!!Children.count(children) && (
        <div className="flex pl-4">
          <List className="flex border-l border-dashed border-primary-main-9/50">{children}</List>
        </div>
      )}
    </li>
  )
}

type NavSectionProps = {
  onLink?: () => void
}

const NavDocs = (props: NavSectionProps): JSX.Element => {
  const { onLink } = props
  return (
    <>
      <Item href="/docs/developer" icon={<IconDocsDevelop />} text="Developer" onLink={onLink}>
        <Item href="/docs/developer/overview" text="Overview" onLink={onLink} />
        <Item href="/docs/developer/dex-api" text="DEX API" onLink={onLink}>
          <Item href="/docs/developer/dex-api/supported" text="Supported" onLink={onLink} />
          <Item href="/docs/developer/dex-api/example-request" text="Example Request" onLink={onLink} />
        </Item>
      </Item>
      <Item href="/docs/xgate-tutorial" icon={<IconDocsTutorial />} text="XGATE Tutorial" onLink={onLink} />
      <Item href="/docs/community" icon={<IconDocsCommunity />} text="Community" onLink={onLink} />
    </>
  )
}

const NavRoot = (props: NavSectionProps): JSX.Element => {
  const { onLink } = props
  return (
    <Item href="/" icon={<IconRoot />} text="Root" onLink={onLink}>
      <Item href="/docs" icon={<IconDocs />} text="Docs" onLink={onLink}>
        <NavDocs onLink={onLink} />
      </Item>
      <Item href="/terminal" icon={<IconTerminal />} text="Terminal" onLink={onLink} />
      <Item href={settings.apps.play.url} icon={<IconPlay />} text="Play" onLink={onLink} />
      <Item href={settings.apps.perf.url} icon={<IconPerf />} text="Perf" onLink={onLink} />
    </Item>
  )
}

type NavProps = {
  className?: string
  path?: 'docs'
  onLink?: () => void
}

const Nav = memo((props: NavProps): JSX.Element => {
  const { className, path, onLink } = props

  return (
    <Animator combine manager="stagger" duration={{ stagger: 0.015 }}>
      <List className={className}>
        {path === 'docs' ? <NavDocs onLink={onLink} /> : <NavRoot onLink={onLink} />}
      </List>
    </Animator>
  )
})

export { Nav }
