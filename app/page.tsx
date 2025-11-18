'use client'

import React from 'react'
import { Animator, Animated, BleepsOnAnimator, cx } from '@arwes/react'
import { Page, Codepen, CollageFrame, DashboardSpeed } from 'iconoir-react'

import { type BleepNames, theme } from '@/config'
import { ButtonSimple } from '@/components/ButtonSimple'

export default (): JSX.Element => {
  return (
    <Animator combine manager="sequenceReverse">
      <BleepsOnAnimator<BleepNames> transitions={{ entering: 'intro' }} continuous />

      <Animated
        as="main"
        className={cx(
          'flex flex-col justify-start items-center',
          'min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-64px)] w-full',
          'pt-20 md:pt-32 px-6 md:px-12 pb-6 md:pb-12 m-auto'
        )}
        animated={[['y', theme.space(6), 0, 0]]}
      >
        {/* TITLE SECTION */}
        <Animator>
          <Animated 
            as="h1" 
            className="text-center mb-4"
            animated={[['y', theme.space(4), 0, 0]]}
          >
            <div 
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-cyan-400"
              style={{
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 200, 255, 0.6)',
                letterSpacing: '0.1em',
                fontFamily: 'Tomorrow, sans-serif'
              }}
            >
              ARWES
            </div>
          </Animated>
        </Animator>

        {/* SUBTITLE SECTION */}
        <Animator>
          <Animated
            as="p"
            className={cx(
              'text-center text-sm md:text-base',
              'text-cyan-300 select-none mb-8 md:mb-12'
            )}
            animated={['flicker']}
          >
            Futuristic Sci-Fi UI Web Framework
          </Animated>
        </Animator>

        {/* BUTTONS SECTION */}
        <Animator>
          <Animated
            as="nav"
            className="flex flex-row justify-center items-center gap-2 md:gap-4"
            animated={['flicker']}
          >
            <a href="https://next.arwes.dev/" target="_blank" rel="noopener noreferrer">
              <ButtonSimple
                tabIndex={-1}
                title="Go to Documentation"
                animated={[['x', theme.spacen(-6), 0, 0]]}
              >
                <Page />
                <span>Docs</span>
              </ButtonSimple>
            </a>

            <a href="https://next.arwes.dev/" target="_blank" rel="noopener noreferrer">
              <ButtonSimple
                tabIndex={-1}
                title="Go to Demos"
                animated={[['x', theme.spacen(-3), 0, 0]]}
              >
                <CollageFrame />
                <span>Demos</span>
              </ButtonSimple>
            </a>

            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <ButtonSimple
                tabIndex={-1}
                title="Go to Playground"
                animated={[['x', theme.spacen(3), 0, 0]]}
              >
                <Codepen />
                <span>Play</span>
              </ButtonSimple>
            </a>

            <a href="https://docs.arwes.dev" target="_blank" rel="noopener noreferrer">
              <ButtonSimple
                tabIndex={-1}
                title="Go to Performance"
                animated={[['x', theme.spacen(6), 0, 0]]}
              >
                <DashboardSpeed />
                <span>Perf</span>
              </ButtonSimple>
            </a>
          </Animated>
        </Animator>

      </Animated>
    </Animator>
  )
}