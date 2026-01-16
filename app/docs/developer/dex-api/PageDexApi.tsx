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

      <AR.Table minWidth="25rem" className="not-prose">
        <AR.Row className="grid grid-cols-[8rem_1fr] lg:grid-cols-[12rem_1fr]">
          <AR.Cell isHeader>Parameter</AR.Cell>
          <AR.Cell isHeader>Type</AR.Cell>
          <AR.Cell isHeader>Notes</AR.Cell>
        </AR.Row>
        {[
          { parameter:'chainId',type:'string', description: 'Network filter (must be included in the supported chains list)' },
          { parameter:'dexID',type:'string', description: 'DEX filter (depends on chainId)' },
          { parameter:'trendingscore', type:'string', description: 'Valid: m5, h1, h6, h24' },
          { parameter:'tokenprofile', type:'boolean', description: 'paid dex or somting' },
          { parameter:'booster', type:'boolean', description: 'Token has booster' },
          { parameter:'advertising', type:'boolean', description: 'Filtering Aadvertising tokens' },
        ].map(({ parameter, type, description }) => (
          <AR.Row key={parameter} className="grid grid-cols-[10rem_1fr] lg:grid-cols-[15rem_1fr]">
            <AR.Cell>
              <code>{parameter}</code>
            </AR.Cell>
            <AR.Cell>{type}</AR.Cell>
            <AR.Cell>{description}</AR.Cell>
          </AR.Row>
        ))}
      </AR.Table>

      <AR.H2>Further Documentation</AR.H2>

      <AR.Links
        compact
        links={[
          { href: '/docs/developer/dex-api/supported', text: 'Chains & DEXs' },
          { href: '/docs/developer/dex-api/example-request', text: 'Example Request' }
        ]}
      />

      <AR.Navigation prevHref="/docs/developer/overview" prev="Overview" nextHref="/docs/developer/dex-api/supported" next="Supported" />
    </>
  )
}

export { PageDexApi }
