'use client'

import React from 'react'
import { Animator, Animated, BleepsOnAnimator, cx } from '@arwes/react'
import Link from 'next/link'
import { Page, Codepen, Brain, Coins } from 'iconoir-react'

import { type BleepNames, settings, theme } from '@/config'
import { XgateLogoType, ButtonSimple } from '@/components'

const PageHome = (): JSX.Element => {
  return (
    <Animator combine manager="sequenceReverse">
      <BleepsOnAnimator<BleepNames> transitions={{ entering: 'intro' }} continuous />

      <Animated
        as="main"
        className={cx('flex flex-col justify-center items-center gap-4 m-auto p-6', 'md:gap-8')}
        animated={[['y', theme.space(6), 0, 0]]}
      >
        <Animator>
          <Animated as="h1" className="pb-2" title={settings.title}>
            <XgateLogoType className="w-[200px] md:w-[240px] xl:w-[480px]" />
          </Animated>
        </Animator>

        <Animator>
          <Animated
            as="p"
            className={cx(
              'font-body leading-none text-size-7 select-none',
              'text-primary-main-3',
              'md:text-size-6',
              'xl:text-size-5'
            )}
            animated={['flicker']}
          >
            Don't Trade Blind — Illuminate the Dark Forest
          </Animated>
        </Animator>

        <Animator>
          <Animated
            as="nav"
            className="flex flex-row justify-center items-center gap-2 md:gap-4"
            animated={['flicker']}
          >
            <Link href="/chat">
              <ButtonSimple
                tabIndex={-1}
                title="Go to Blokchain AI Chat"
                animated={[['x', theme.spacen(-3), 0, 0]]}
              >
                <Brain className="text-size-[1.5em] xhidden x2sm:block" />
                <span>AI Chat</span>
              </ButtonSimple>
            </Link>

            <a href={settings.apps.play.url}>
              <ButtonSimple
                tabIndex={-1}
                title="Go to Playground"
                animated={[['x', theme.spacen(3), 0, 0]]}
              >
                <Codepen className="text-size-[1.5em] xhidden x2sm:block" />
                <span>Play</span>
              </ButtonSimple>
            </a>

            <Link href="/tokenomic">
              <ButtonSimple
                tabIndex={-1}
                title="Go to Tokenomic"
                animated={[['x', theme.spacen(6), 0, 0]]}
              >
                <Coins className="text-size-[1.5em] xhidden x2sm:block" />
                <span>Tokenomic</span>
              </ButtonSimple>
            </Link>

            <Link href="/docs">
              <ButtonSimple
                tabIndex={-1}
                title="Go to Documentation"
                animated={[['x', theme.spacen(-6), 0, 0]]}
              >
                <Page className="text-size-[1.5em] xhidden x2sm:block" />
                <span>Docs</span>
              </ButtonSimple>
            </Link>            
          </Animated>
        </Animator>
      </Animated>
    </Animator>
  )
}

export { PageHome }
