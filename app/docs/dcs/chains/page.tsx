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
          DCS API supports multiple blockchain networks with various DEX integrations. Below is a comprehensive list of supported chains and their compatible DEXs.
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h2" animated={['flicker']}>
          Supported Chains
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          The following blockchain networks are supported:
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
        <Animated as="h3" animated={['flicker']}>
          Solana
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          pumpswap, raydium, meteora, orca, launchlab, pumpfun, dexlab, fluxbeam, meteoradbc, moonit, coinchef, vertigo, tokenmill, superx
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Ethereum
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          uniswap, curve, balancer, pancakeswap, solidlycom, sushiswap, fraxswap, shibaswap, ethervista, defiswap, verse, 9inch, lif3, stepn, orion, safemoonswap, radioshack, wagmi, diamondswap, empiredex, swapr, blueprint, okxdex, memebox, kyberswap, pyeswap, templedao, vulcandex
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          BSC (Binance Smart Chain)
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          pancakeswap, uniswap, thena, squadswap, unchain-x, biswap, fstswap, apeswap, bakeryswap, coinfair, tiktokfun, babyswap, dinosaureggs, sushiswap, mdex, babydogeswap, orion, nomiswap, dexswap, tidaldex, openocean, knightswap, autoshark, safemoonswap, marsecosystem, iziswap, mochiswap, planetfinance, elkfinance, w3swap, swych, jetswap, hyperjump, coneexchange, fraxswap, kyotoswap, radioshack, jswap, baryonswap, padswap, traderjoe, orbitalswap, saitaswap, sphynx, pandora, leonicorn, annexfinance, empiredex, diamondswap, pyreswap, niob, kyberswap, pyeswap, lif3, ethervista, aequinox, vertek
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Base
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          aerodrome, uniswap, pancakeswap, baseswap, alien-base, sushiswap, balancer, deltaswap, solidlycom, swapbased, dackieswap, iziswap, equalizer, rocketswap, infusion, 9mm, shark-swap, treble, diamondswap, velocimeter, synthswap, leetswap, citadelswap, basex, robots-farm, horizondex, satori, derpdex, basofinance, candy-swap, cloudbase, fwx, throne, memebox, icecreamswap, crescentswap, moonbase, kokonutswap, lfgswap, oasisswap, degenbrains, cbswap, bakeryswap, basedswap, ethervista, glacier
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Arbitrum
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          uniswap, pancakeswap, camelot, ramses, sushiswap, traderjoe, arbswap, zyberswap, spartadex, deltaswap, solidlycom, fraxswap, kyberswap, swapr, chronos, mmfinance, solidlizard, magicswap, elkfinance, oreoswap, arbidex, swapfish, aegis, mindgames, oasisswap, auragi, alienfi, sharkyswap, apeswap, sterling, dackieswap, 3xcalibur, arbiswap, degenbrains, spinaqdex, shekelswap, ethervista, crescentswap, dexfi
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Polygon
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          quickswap, uniswap, balancer, sushiswap, dooar, retro, apeswap, dfyn, vulcandex, fraxswap, polycat, kyberswap, jetswap, polyzap, gravityfinance, mmfinance, radioshack, dinoswap, dystopia, comethswap, nachofinance, lif3, elkfinance, jamonswap, pearl, algebra, firebird, satin, empiredex, safemoonswap, tetuswap
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Optimism
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          velodrome, uniswap, solidlycom, beethovenx, sushiswap, fraxswap, zipswap, kyberswap, openxswap, superswap, elkfinance, dackieswap
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Avalanche
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          pharaoh, traderjoe, arenatrade, uniswap, pangolin, aquaspace, kyberswap, vapordex, fraxswap, hurricaneswap, lydiafinance, sushiswap, radioshack, swapsicle, hakuswap, elkfinance, alligator, yetiswap, partyswap, glacier, thorus, pyreswap, fwx, diamondswap, onavax, empiredex, tokenmill
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Fantom
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          spookyswap, wigoswap, beethovenx, spiritswap, equalizer, pyreswap, velocimeter, protofi, morpheusswap, hyperjump, solidly, tombswap, sushiswap, paintswap, lif3, solidlycom, farmtom, degenhaus, redemption, knightswap, soulswap, excalibur, elkfinance, yoshiexchange, wingswap, bombswap, jetswap, skullswap, memebox, defyswap, kyberswap, wagmi, empiredex, fraxswap
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Blast
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          thruster, ring, fenix, blade, uniswap, ambient, blaster, monoswap, roguex, sushiswap, swapblast, cyberblast, hyperblast, diamondswap, dyorswap, bitdex, dackieswap, icecreamswap
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          ZkSync
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          pancakeswap, syncswap, zkswap, oku, spacefi, koi, iziswap, velocore, ezkalibur, vesync, gemswap, wagmi, derpdex, draculafi, holdstation, gameswap
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Sui
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          bluefin, cetus, turbos-finance, aftermath, flowx, bluemove
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Cardano
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          minswap, wingriders, sundaeswap
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Algorand
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          tinyman
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Starknet
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          ekubo, jediswap, nostra, sithswap
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Story
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          piperx, storyhunt, story-fun
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Dogechain
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          quickswap, dogeswap, fraxswap, kibbleswap, yodeswap, dogeshrek, bourbondefi, pupswap
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Core
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          glyph, corex, sushiswap, archerswap, shadowswap, longswap, icecreamswap, lfgswap, viridian
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Injective
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          dojoswap
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Mantle
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          merchantmoe, agni, cleo, fusionx, methlab, funny-money, iziswap, butter.xyz, crust, swapsicle, velocimeter
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Soneium
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          velodrome, kyo-finance, sonex, sonus, sonefi, dyorswap
        </Animated>
      </Animator>

      <Animator>
        <Animated as="h3" animated={['flicker']}>
          Apechain
        </Animated>
      </Animator>

      <Animator>
        <Animated as="p" animated={['flicker']}>
          camelot, saru, dyorswap
        </Animated>
      </Animator>
    </Animator>
  )
}
