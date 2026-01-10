'use client'

import Link from 'next/link'
import { Animated, Animator, BleepsOnAnimator, Text } from '@arwes/react'
import { Book as IconBook, Page as IconDocs } from 'iconoir-react'

import { type BleepNames, theme } from '@/config'
import { Button, FrameAlert } from '@/components'

const PageXgateTutorial = (): JSX.Element => {
  return (
    <Animator combine>
      <BleepsOnAnimator<BleepNames> transitions={{ entering: 'intro' }} continuous />

      <div className="flex-1 flex justify-center items-center p-4">
        <div className="relative flex px-6 py-12 md:p-12 xl:p-20">
          <Animator duration={{ enter: 0.6 }}>
            <FrameAlert />
          </Animator>

          <main className="relative flex flex-col items-center gap-6">
            <Animator duration={{ delay: 0.3 }}>
              <Animated
                className="text-primary-4 text-[4rem]"
                animated={['flicker', ['y', theme.space(4), 0]]}
              >
                <IconBook />
              </Animated>
            </Animator>

            <Animator>
              <Text as="h1" className="font-header text-size-2 leading-none text-primary-5" fixed>
                XGATE Tutorial
              </Text>
            </Animator>

            <Animator duration={{ delay: 0.3 }}>
              <Animated
                as="p"
                className="font-body text-size-8 md:text-size-7 text-primary-3"
                animated={['flicker', ['y', theme.space(-4), 0]]}
              >
                Tutorial content is being prepared.
              </Animated>
            </Animator>

            <Animator duration={{ delay: 0.3 }}>
              <Animated
                className="flex flex-row items-center gap-4"
                animated={['flicker', ['y', theme.space(-6), 0]]}
              >
                <Link href="/docs">
                  <Button tabIndex={-1}>
                    Back <IconDocs />
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

export { PageXgateTutorial }
