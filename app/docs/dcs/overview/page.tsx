'use client'

import type { ReactElement } from 'react'
import { Animated, Animator, BleepsOnAnimator } from '@arwes/react'

import { type BleepNames } from '@/config'

export default function Page(): ReactElement {
  return (
    <Animator combine>
      <BleepsOnAnimator<BleepNames> transitions={{ entering: 'intro' }} continuous />

      <Animator>
        <Animated as="h1" animated={['flicker']}>
          DCS Documentation
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          Comprehensive API documentation for DCS (Data & Crypto Screener) endpoints.
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h2" animated={['flicker']}>
          API: /api/dex
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Request Parameters (Query String)
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          The following parameters can be used to customize your DEX API requests:
        </Animated>
      </Animator>

      <Animator>
        <Animated as="ul" animated={['flicker']}>
          <li><strong>chainId</strong> (string, optional): Blockchain network</li>
          <li><strong>dexId</strong> (string, optional): DEX identifier (depends on selected chainId)</li>
          <li><strong>trendingscore</strong> (string, default: h6): Time period for trending score (m5, h1, h6, h24)</li>
          <li><strong>tokenprofile</strong> (boolean, default: false): Include token profile data</li>
          <li><strong>booster</strong> (boolean, default: false): Include booster information</li>
          <li><strong>advertising</strong> (boolean, default: false): Include advertising data</li>
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Example Request
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          Get all networks with 6-hour trending score:
        </Animated>
      </Animator>

      <Animator>
        <Animated as="pre" animated={['flicker']}>
          <code>GET /api/dex?trendingscore=h6</code>
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Response (JSON)
        </Animated>
      </Animator>

      <Animator>
        <Animated as="pre" animated={['flicker']}>
          <code>{`{
  "pairs": [
    // list of token pair info
  ]
}`}</code>
        </Animated>
      </Animator>
    </Animator>
  )
}
