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
          Developer Documentation
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          Panduan cara request API project XGATE (Data & Crypto Screener) dan struktur responsenya.
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h2" animated={['flicker']}>
          Endpoint: /api/dex
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Request Parameters (Query String)
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          Parameter yang bisa dipakai untuk filter data:
        </Animated>
      </Animator>

      <Animator>
        <Animated as="ul" animated={['flicker']}>
          <li>
            <strong>chainId</strong> (string, optional): Nama jaringan (contoh: solana, ethereum, bsc).
          </li>
          <li>
            <strong>dexId</strong> (string, optional): Nama DEX (bergantung chainId).
          </li>
          <li>
            <strong>trendingscore</strong> (string, default: h6): m5, h1, h6, h24.
          </li>
          <li>
            <strong>tokenprofile</strong> (boolean, default: false)
          </li>
          <li>
            <strong>booster</strong> (boolean, default: false)
          </li>
          <li>
            <strong>advertising</strong> (boolean, default: false)
          </li>
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Example Request
        </Animated>
      </Animator>

      <Animator>
        <Animated as="pre" animated={['flicker']}>
          <code>GET /api/dex?trendingscore=h6</code>
        </Animated>
      </Animator>

      <Animator>
        <Animated as="pre" animated={['flicker']}>
          <code>GET /api/dex?chainId=solana&amp;trendingscore=h6</code>
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
