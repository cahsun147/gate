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
          Supported Chains & DEXs
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          Daftar chain dan DEX yang didukung oleh endpoint /api/dex.
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h2" animated={['flicker']}>
          Supported Chains
        </Animated>
      </Animator>

      <Animator>
        <Animated as="ul" animated={['flicker']}>
          <li>Solana</li>
          <li>Ethereum</li>
          <li>BSC (Binance Smart Chain)</li>
          <li>Base</li>
          <li>Avalanche</li>
          <li>Polygon</li>
          <li>Optimism</li>
          <li>Arbitrum</li>
          <li>Fantom</li>
          <li>Pulsechain</li>
          <li>Sui</li>
          <li>Hyperliquid</li>
          <li>Hyperevm</li>
          <li>Cardano</li>
          <li>Algorand</li>
          <li>ZkSync</li>
          <li>Near</li>
          <li>Polkadot</li>
          <li>Tron</li>
          <li>Dogechain</li>
          <li>Injective</li>
          <li>Cosmos</li>
          <li>Celo</li>
          <li>Kava</li>
          <li>Harmony</li>
          <li>Elastos</li>
          <li>Meter</li>
          <li>Telos</li>
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h2" animated={['flicker']}>
          Supported DEXs by Chain
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          Halaman ini akan diisi lebih lengkap (per-chain list DEX) sesuai konfigurasi API.
        </Animated>
      </Animator>
    </Animator>
  )
}
