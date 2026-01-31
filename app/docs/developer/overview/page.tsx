'use client'

import { AR } from '@/components'
import { Code as IconCode } from 'iconoir-react'

export default function Page(): JSX.Element {
  return (
    <>
      <AR.Header>Text Fundamentals</AR.Header>

      <AR.P>
        This documentation provides the essentials for using XGATE APIs, including key notes about
        service usage, privacy, and common questions before you start integrating the available
        endpoints.
      </AR.P>

      <AR.Links links={[{ href: '/docs/developer/dex-api', text: 'DEX API', icon: <IconCode /> }]} />

      <AR.H2>Disclaimer</AR.H2>

      <AR.P>
        The information and data provided by XGATE are intended for research, community, and
        development purposes. XGATE is not a financial advisor, and any usage of the data is entirely
        the user&apos;s responsibility. Data may change, be delayed, or be inaccurate depending on network
        conditions and upstream data providers.
      </AR.P>

      <AR.H2>Privacy Policy</AR.H2>

      <AR.P>
        XGATE does not request or store private keys, seed phrases, or other sensitive credentials. API
        requests may be recorded as technical logs (e.g., IP address, user-agent, access time) for
        security and service maintenance. If you call the API from your own application, make sure you
        never send sensitive data through query parameters or request bodies.
      </AR.P>

      <AR.H2>FAQ</AR.H2>

      <AR.H3>Does XGATE have a token?</AR.H3>

      <AR.P>
        Yes, XGATE has a token. Official details such as network, contract address, utility, and the
        roadmap will be announced through official channels. Always verify sources before interacting
        with any contract or token.
      </AR.P>

      <AR.H3>Where does XGATE get data from?</AR.H3>

      <AR.P>
        XGATE data comes from on-chain sources (directly from blockchains) as well as several blockchain
        API/data providers (such as RPC providers, explorers/indexers, and market data aggregation
        services). For specific features like DEX trending, the backend can fetch data from public DEX
        data providers and then process it to make it easier to consume.
      </AR.P>

      <AR.Navigation prevHref="/docs" prev="Index" nextHref="/docs/developer/dex-api" next="DEX API" />
    </>
  )
}
