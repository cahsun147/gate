'use client'

import { AR } from '@/components'

const PageDexApi = (): JSX.Element => {
  return (
    <>
      <AR.Header>DEX API</AR.Header>

      <AR.P>
        Endpoint DEX digunakan untuk mengambil data trending pair dari DexScreener melalui backend XGATE.
        Route backend yang tersedia adalah <code>/api/v1/dex</code>.
      </AR.P>

      <AR.H2>Endpoint</AR.H2>

      <AR.UL>
        <li>
          <code>GET /api/v1/dex</code> (mode screener)
        </li>
        <li>
          <code>GET /api/v1/dex/:network/:address</code> (mode detail)
        </li>
      </AR.UL>

      <AR.H2>Query Parameters</AR.H2>

      <AR.Table minWidth="48rem" className="not-prose">
        <AR.Row>
          <AR.Cell isHeader>Parameter</AR.Cell>
          <AR.Cell isHeader>Type</AR.Cell>
          <AR.Cell isHeader>Default</AR.Cell>
          <AR.Cell isHeader>Catatan</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>chainId</code>
          </AR.Cell>
          <AR.Cell>string</AR.Cell>
          <AR.Cell>-</AR.Cell>
          <AR.Cell>Filter network (harus termasuk dalam daftar supported chains).</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>dexId</code>
          </AR.Cell>
          <AR.Cell>string</AR.Cell>
          <AR.Cell>-</AR.Cell>
          <AR.Cell>Filter DEX (bergantung pada <code>chainId</code>).</AR.Cell>
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
          <AR.Cell>Parameter ini ada di README, namun tidak divalidasi oleh handler Go saat ini.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>booster</code>
          </AR.Cell>
          <AR.Cell>boolean</AR.Cell>
          <AR.Cell>false</AR.Cell>
          <AR.Cell>Parameter ini ada di README, namun tidak divalidasi oleh handler Go saat ini.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>advertising</code>
          </AR.Cell>
          <AR.Cell>boolean</AR.Cell>
          <AR.Cell>false</AR.Cell>
          <AR.Cell>Parameter ini ada di README, namun tidak divalidasi oleh handler Go saat ini.</AR.Cell>
        </AR.Row>
      </AR.Table>

      <AR.H2>Dokumentasi Lanjutan</AR.H2>

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
