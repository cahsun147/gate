'use client'

import { Animated, Animator, Text, cx } from '@arwes/react'
import Link from 'next/link'
import {
  Coins as IconTokenDistribution,
  DesignNib as IconTokenGrowth,
  Community as IconTokenCommunity
} from 'iconoir-react'

import { Hr, Card, ArwesLogoIcon } from '@/components'

const PageTokenomic = (): JSX.Element => {
  return (
    <Animator combine manager="sequence">
      <div
        className={cx('relative', 'flex-1 overflow-y-auto', 'flex p-4 min-w-0 min-h-0', 'md:p-8')}
      >
        <Animator duration={{ enter: 1 }}>
          <div className="absolute inset-0 flex">
            <ArwesLogoIcon
              className="m-auto size-24 md:size-32 opacity-0"
              animated={[
                {
                  initialStyle: { opacity: 1 },
                  transitions: {
                    entering: { scale: [1.25, 1], rotate: [-90, 0], duration: 0.75 }
                  }
                },
                { transitions: { entering: { opacity: 0, delay: 0.75, duration: 0.25 } } },
                {
                  transitions: {
                    entering: ({ $, animate, stagger }) =>
                      animate(
                        [...$('[data-name="out"]'), ...$('[data-name="center"]')],
                        { opacity: [0, 1, 0.5, 1] },
                        { delay: stagger(0.1), duration: 0.5 }
                      )
                  }
                },
                {
                  transitions: {
                    entering: ({ $, animate }) =>
                      animate(
                        $('[data-name="out-bg"], [data-name="middle"]'),
                        { opacity: [0, 1] },
                        { delay: 0.2, duration: 0.5 }
                      )
                  }
                }
              ]}
              hasRotation={false}
            />
          </div>
        </Animator>

        <Animator combine>
          <div
            className={cx(
              'relative flex flex-col gap-8 m-auto min-w-0 min-h-0 max-w-screen-xl',
              'md:grid md:grid-cols-2 md:items-center md:gap-12',
              'lg:gap-16'
            )}
          >
            <Animator combine manager="stagger">
              <article className="flex flex-col gap-6 prose prose-sm lg:prose-base lg:gap-8">
                <Animator>
                  <Text as="h1" className="!m-0" fixed>
                    Tokenomic Overview
                  </Text>
                </Animator>

                <Animator>
                  <Hr
                    className="!m-0 origin-left"
                    size={2}
                    animated={[['scaleX', 0, 1]]}
                    direction="both"
                  />
                </Animator>

                <Animator>
                  <Text className="!m-0">
                    Discover the economic model behind our token. Learn about distribution, 
                    allocation, and the mechanisms that drive value and sustainability. 
                    Our tokenomics are designed to ensure long-term growth and community participation.
                  </Text>
                </Animator>

                <Animator>
                  <Animated
                    as="nav"
                    className="flex flex-row flex-wrap !m-0 gap-1 lg:flex-nowrap"
                    animated={{
                      transitions: {
                        entering: ({ $, duration, animate, stagger }) =>
                          animate(
                            $('a'),
                            { opacity: [0, 1, 0.5, 1] },
                            { duration, delay: stagger(0.05) }
                          ),
                        exiting: { opacity: [1, 0, 0.5, 0] }
                      }
                    }}
                  >
                    <a
                      className="brightness-[0.8] transition-all ease-out duration-200 hover:brightness-100"
                      href="#whitepaper"
                      target="_blank"
                    >
                      <img
                        className="!m-0"
                        src="https://img.shields.io/badge/Whitepaper-Read-00ffff?style=flat-square"
                        alt="Whitepaper"
                      />
                    </a>
                    <a
                      className="brightness-[0.8] transition-all ease-out duration-200 hover:brightness-100"
                      href="#roadmap"
                      target="_blank"
                    >
                      <img
                        className="!m-0"
                        src="https://img.shields.io/badge/Roadmap-View-00ffff?style=flat-square"
                        alt="Roadmap"
                      />
                    </a>
                    <a
                      className="brightness-[0.8] transition-all ease-out duration-200 hover:brightness-100"
                      href="#analytics"
                      target="_blank"
                    >
                      <img
                        className="!m-0"
                        src="https://img.shields.io/badge/Analytics-Explore-00ffff?style=flat-square"
                        alt="Analytics"
                      />
                    </a>
                  </Animated>
                </Animator>
              </article>
            </Animator>

            <Animator combine manager="stagger" duration={{ stagger: 0.1 }}>
              <div className="flex flex-col gap-6 lg:gap-8">
                <Animator>
                  <Link href="#distribution">
                    <Card
                      title="Distribution"
                      description="Token allocation across different stakeholders."
                      icon={<IconTokenDistribution />}
                    />
                  </Link>
                </Animator>
                <Animator>
                  <Link href="#growth">
                    <Card
                      title="Growth"
                      description="Mechanisms for sustainable token value growth."
                      icon={<IconTokenGrowth />}
                    />
                  </Link>
                </Animator>
                <Animator>
                  <Link href="#community">
                    <Card
                      title="Community"
                      description="Governance and community participation rewards."
                      icon={<IconTokenCommunity />}
                    />
                  </Link>
                </Animator>
              </div>
            </Animator>
          </div>
        </Animator>
      </div>
    </Animator>
  )
}

export { PageTokenomic }
