'use client'

import { AR } from '@/components'

const PageDexApi = (): JSX.Element => {
  return (
    <>
      <AR.Header>DEX API</AR.Header>

      <AR.P>
        DEX API berguna untuk mendapatkan data trending token dari chain dan DEX yang didukung melalui
        backend XGATE. Backend route-nya adalah <code>/api/v1/dex</code>.
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
        <AR.Row className="grid grid-cols-[8rem_6rem_1fr] lg:grid-cols-[12rem_8rem_1fr]">
          <AR.Cell isHeader>Parameter</AR.Cell>
          <AR.Cell isHeader>Type</AR.Cell>
          <AR.Cell isHeader>Notes</AR.Cell>
        </AR.Row>
        {[
          {
            parameter: 'chainId',
            type: 'string',
            description: 'Filter network (harus termasuk di daftar chain yang didukung).'
          },
          {
            parameter: 'dexId',
            type: 'string',
            description: 'Filter DEX (tergantung chainId).'
          },
          {
            parameter: 'trendingscore',
            type: 'string',
            description: 'Trending window. Valid: m5, h1, h6, h24 (default biasanya h6).'
          }
        ].map(({ parameter, type, description }) => (
          <AR.Row key={parameter} className="grid grid-cols-[8rem_6rem_1fr] lg:grid-cols-[12rem_8rem_1fr]">
            <AR.Cell className="whitespace-nowrap">
              <code>{parameter}</code>
            </AR.Cell>
            <AR.Cell className="whitespace-nowrap">{type}</AR.Cell>
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
