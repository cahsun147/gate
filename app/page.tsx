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
          'flex flex-col justify-center items-center',
          'min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-64px)] w-full',
          'gap-12 p-6 md:p-12 m-auto'
        )}
        animated={[['y', theme.space(6), 0, 0]]}
      >
        {/* HERO SECTION */}
        <div className="flex flex-col items-center justify-center gap-6 max-w-3xl w-full">
          
          {/* TITLE */}
          <Animator>
            <Animated 
              as="h1" 
              className="text-center"
              animated={[['y', theme.space(4), 0, 0]]}
            >
              <div 
                className="text-6xl md:text-7xl lg:text-8xl font-bold text-cyan-400"
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

          {/* SUBTITLE */}
          <Animator>
            <Animated
              as="p"
              className={cx(
                'text-center text-lg md:text-xl',
                'text-cyan-300 select-none'
              )}
              animated={['flicker']}
            >
              Futuristic Sci-Fi UI Web Framework
            </Animated>
          </Animator>

        </div>

        {/* BUTTONS SECTION */}
        <Animator>
          <Animated
            as="nav"
            className="flex flex-row justify-center items-center gap-4 md:gap-6 flex-wrap"
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