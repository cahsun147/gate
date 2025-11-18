'use client'

import React, { useCallback, useState } from 'react'
import Link from 'next/link'
import { Animated, Animator, cx, memo, type AnimatedProp } from '@arwes/react'
import { Menu as MenuIcon, X, Github, Discord } from 'iconoir-react'

import { type BleepNames, theme } from '@/config'
import { ButtonSimple } from './ButtonSimple'

interface HeaderProps {
  className?: string
  animated?: AnimatedProp
}

const Header = memo((props: HeaderProps): JSX.Element => {
  const { className, animated } = props
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen)
  }, [isMenuOpen])

  return (
    <Animated
      as="header"
      className={cx(
        'flex justify-center items-center select-none',
        'w-full bg-transparent border-b border-cyan-900/30',
        className
      )}
      animated={animated}
    >
      <div className={cx('flex mx-auto p-3 w-full max-w-7xl', 'md:px-6', 'md:py-4')}>
        {/* LOGO & TITLE */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div 
              className="text-xl md:text-2xl font-bold text-cyan-400"
              style={{
                textShadow: '0 0 10px rgba(0, 255, 255, 0.6)',
                fontFamily: 'Tomorrow, sans-serif',
                letterSpacing: '0.05em'
              }}
            >
              ARWES
            </div>
          </Link>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-3">
          <a href="https://next.arwes.dev/" target="_blank" rel="noopener noreferrer">
            <ButtonSimple 
              tabIndex={-1}
              title="Documentation"
              animated={[['x', theme.spacen(3), 0, 0]]}
            >
              <span className="text-sm">Docs</span>
            </ButtonSimple>
          </a>

          <a href="https://github.com/arwes/arwes" target="_blank" rel="noopener noreferrer">
            <ButtonSimple 
              tabIndex={-1}
              title="GitHub"
              animated={[['x', theme.spacen(2), 0, 0]]}
            >
              <Github className="w-4 h-4" />
            </ButtonSimple>
          </a>

          <a href="https://discord.gg/arwes" target="_blank" rel="noopener noreferrer">
            <ButtonSimple 
              tabIndex={-1}
              title="Discord"
              animated={[['x', theme.spacen(3), 0, 0]]}
            >
              <Discord className="w-4 h-4" />
            </ButtonSimple>
          </a>
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden flex items-center justify-center p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-slate-950/95 border-b border-cyan-900/30 backdrop-blur">
          <nav className="flex flex-col gap-2 p-4">
            <a href="https://next.arwes.dev/" target="_blank" rel="noopener noreferrer">
              <ButtonSimple 
                tabIndex={-1}
                title="Documentation"
                className="w-full"
              >
                <span className="text-sm">Docs</span>
              </ButtonSimple>
            </a>

            <a href="https://github.com/arwes/arwes" target="_blank" rel="noopener noreferrer">
              <ButtonSimple 
                tabIndex={-1}
                title="GitHub"
                className="w-full"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">GitHub</span>
              </ButtonSimple>
            </a>

            <a href="https://discord.gg/arwes" target="_blank" rel="noopener noreferrer">
              <ButtonSimple 
                tabIndex={-1}
                title="Discord"
                className="w-full"
              >
                <Discord className="w-4 h-4" />
                <span className="text-sm">Discord</span>
              </ButtonSimple>
            </a>
          </nav>
        </div>
      )}
    </Animated>
  )
})

export { Header }
