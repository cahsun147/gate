'use client'

import { Animated, Animator, Text } from '@arwes/react'

const PageCommunitySimilars = (): JSX.Element => {
  return (
    <Animator combine manager="stagger" duration={{ stagger: 0.05 }}>
      <Animator>
        <Text as="h2" className="font-header text-size-6 text-primary-main-4" fixed>
          Crypto Resources
        </Text>
      </Animator>

      <Animator>
        <Animated as="p" className="font-body text-size-8 text-primary-main-5" animated={['flicker']}>
          Halaman ini akan berisi referensi project crypto, list DEX/chain, sumber data, dan link tools.
        </Animated>
      </Animator>

      <Animator>
        <Animated as="ul" className="list-disc pl-6" animated={['flicker']}>
          <li>Explorer & Analytics</li>
          <li>DEX Aggregator</li>
          <li>Liquidity / Pair Tracker</li>
          <li>Security & Contract Analyzer</li>
        </Animated>
      </Animator>
    </Animator>
  )
}

export { PageCommunitySimilars }
