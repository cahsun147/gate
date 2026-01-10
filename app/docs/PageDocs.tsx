'use client'

import Link from 'next/link'
import { Animated, Animator, BleepsOnAnimator, Text } from '@arwes/react'
import { Page as IconDocs, Book as IconDocumentation } from 'iconoir-react'

import { type BleepNames, theme } from '@/config'
import { Button, FrameAlert } from '@/components'

const PageDocs = (): JSX.Element => {
  return (
    <Animator combine>
      <BleepsOnAnimator<BleepNames> transitions={{ entering: 'intro' }} continuous />

      <div className="flex-1 flex justify-center items-center p-4">
        <div className="relative flex w-full max-w-3xl px-6 py-12 md:p-12 xl:p-20 overflow-hidden sm:overflow-visible">
          <Animator duration={{ enter: 0.6 }}>
            <FrameAlert />
          </Animator>

          <main className="relative flex flex-col items-center gap-6">
            <Animator duration={{ delay: 0.3 }}>
              <Animated
                className="text-primary-4 text-[3rem] sm:text-[4rem]"
                animated={['flicker', ['y', theme.space(4), 0]]}
              >
                <IconDocumentation />
              </Animated>
            </Animator>

            <Animator>
              <Text as="h1" className="font-header text-size-2 leading-none text-primary-5" fixed>
                Documentation
              </Text>
            </Animator>

            <Animator duration={{ delay: 0.3 }}>
              <Animated
                as="p"
                className="font-body text-size-8 md:text-size-7 text-primary-3"
                animated={['flicker', ['y', theme.space(-4), 0]]}
              >
                Comprehensive guides and API documentation.
              </Animated>
            </Animator>

            <Animator duration={{ delay: 0.3 }}>
              <Animated
                className="flex flex-col sm:flex-row flex-wrap justify-center items-stretch sm:items-center gap-3 sm:gap-4 w-full"
                animated={['flicker', ['y', theme.space(-6), 0]]}
              >
                <Link href="/docs/developer" className="w-full sm:w-auto">
                  <Button tabIndex={-1} className="w-full sm:w-auto text-size-11 sm:text-size-10">
                    Developer <IconDocs />
                  </Button>
                </Link>
                <Link href="/docs/xgate-tutorial" className="w-full sm:w-auto">
                  <Button tabIndex={-1} className="w-full sm:w-auto text-size-11 sm:text-size-10">
                    XGATE Tutorial <IconDocs />
                  </Button>
                </Link>
                <Link href="/docs/community" className="w-full sm:w-auto">
                  <Button tabIndex={-1} className="w-full sm:w-auto text-size-11 sm:text-size-10">
                    Community <IconDocs />
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button tabIndex={-1} className="w-full sm:w-auto text-size-11 sm:text-size-10">
                    Home <IconDocs />
                  </Button>
                </Link>
              </Animated>
            </Animator>
          </main>
        </div>
      </div>
    </Animator>
  )
}

export { PageDocs }
