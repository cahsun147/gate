'use client'

import { AR } from '@/components'

const PageDexApi = (): JSX.Element => {
  return (
    <>
      <AR.Header>DEX API</AR.Header>

      <AR.P>
        The DEX endpoint is used to fetch trending pair data from DexScreener through the XGATE backend.
        The backend route is <code>/api/v1/dex</code>.
      </AR.P>

      <AR.H2>Endpoint</AR.H2>

      <AR.UL>
        <li>
          <code>GET /api/v1/dex</code> (screener mode)
        </li>
        <li>
          <code>GET /api/v1/dex/:network/:address</code> (detail mode)
        </li>
      </AR.UL>

      <AR.H2>Query Parameters</AR.H2>

      <AR.Table minWidth="48rem" className="not-prose">
        <AR.Row>
          <AR.Cell isHeader>Parameter</AR.Cell>
          <AR.Cell isHeader>Type</AR.Cell>
          <AR.Cell isHeader>Default</AR.Cell>
          <AR.Cell isHeader>Notes</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>chainId</code>
          </AR.Cell>
          <AR.Cell>string</AR.Cell>
          <AR.Cell>-</AR.Cell>
          <AR.Cell>Network filter (must be included in the supported chains list).</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>dexId</code>
          </AR.Cell>
          <AR.Cell>string</AR.Cell>
          <AR.Cell>-</AR.Cell>
          <AR.Cell>DEX filter (depends on <code>chainId</code>).</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>trendingscore</code>
          </AR.Cell>
          <AR.Cell>string</AR.Cell>
          <AR.Cell>h6</AR.Cell>
          <AR.Cell>
            Valid: <code>m5</code>, <code>h1</code>, <code>h6</code>, <code>h24</code>.
          </AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>tokenprofile</code>
          </AR.Cell>
          <AR.Cell>boolean</AR.Cell>
          <AR.Cell>false</AR.Cell>
          <AR.Cell>This parameter exists in the README, but is not currently validated by the Go handler.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>booster</code>
          </AR.Cell>
          <AR.Cell>boolean</AR.Cell>
          <AR.Cell>false</AR.Cell>
          <AR.Cell>This parameter exists in the README, but is not currently validated by the Go handler.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>advertising</code>
          </AR.Cell>
          <AR.Cell>boolean</AR.Cell>
          <AR.Cell>false</AR.Cell>
          <AR.Cell>This parameter exists in the README, but is not currently validated by the Go handler.</AR.Cell>
        </AR.Row>
      </AR.Table>

      <AR.H2>Further Documentation</AR.H2>

      <AR.Links
        compact
        links={[
          { href: '/docs/developer/dex-api/supported', text: 'Supported Chains & DEXs' },
          { href: '/docs/developer/dex-api/example-request', text: 'Example Request' }
        ]}
      />

      <AR.Navigation prevHref="/docs/developer/overview" prev="Overview" nextHref="/docs/developer/dex-api/supported" next="Supported" />
    </>
  )
}

export { PageDexApi }
