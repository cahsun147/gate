'use client'

import { AR } from '@/components'
import { Code as IconCode } from 'iconoir-react'

export default function Page(): JSX.Element {
  return (
    <>
      <AR.Header>Overview</AR.Header>

      <AR.P>
        This documentation explains how to call XGATE APIs and which endpoints are available.
      </AR.P>

      <AR.H2>API Endpoints</AR.H2>

      <AR.Table minWidth="40rem" className="not-prose">
        <AR.Row>
          <AR.Cell isHeader>Endpoint</AR.Cell>
          <AR.Cell isHeader>Method</AR.Cell>
          <AR.Cell isHeader>Description</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>Root API health check.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api/v1/dex</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>DEX screener/proxy for trending pair data.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api/dex</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>Alias used in the README (if your deployment provides a proxy/compat route).</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api/v1/tokens/holder/&lt;network&gt;/&lt;contract_address&gt;</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>Fetch token holders.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api/v1/tokens/traders/&lt;network&gt;/&lt;contract_address&gt;</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>Fetch token traders.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api/v1/wallet/holdings/&lt;network&gt;/&lt;wallet_address&gt;</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>Fetch holdings for a wallet address.</AR.Cell>
        </AR.Row>
      </AR.Table>

      <AR.H2>DEX API</AR.H2>

      <AR.P>
        For detailed documentation of <code>/api/v1/dex</code> / <code>/api/dex</code> (parameters,
        supported chains/DEXs, and example requests), see the section below.
      </AR.P>

      <AR.Links links={[{ href: '/docs/developer/dex-api', text: 'DEX API', icon: <IconCode /> }]} />

      <AR.Navigation prevHref="/docs" prev="Index" nextHref="/docs/developer/dex-api" next="DEX API" />
    </>
  )
}
