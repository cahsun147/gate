'use client'

import { AR } from '@/components'
import { Code as IconCode } from 'iconoir-react'

export default function Page(): JSX.Element {
  return (
    <>
      <AR.Header>For Developer</AR.Header>

      <AR.P>
        Dokumentasi ini menjelaskan cara request API XGATE dan endpoint apa saja yang tersedia.
      </AR.P>

      <AR.H2>Daftar Endpoint API</AR.H2>

      <AR.Table minWidth="40rem" className="not-prose">
        <AR.Row>
          <AR.Cell isHeader>Endpoint</AR.Cell>
          <AR.Cell isHeader>Method</AR.Cell>
          <AR.Cell isHeader>Deskripsi</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>Tes root API.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api/v1/dex</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>DEX screener/proxy untuk data trending pair.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api/dex</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>Alias yang dipakai di README (jika deployment kamu menyediakan proxy/compat).</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api/v1/tokens/holder/&lt;network&gt;/&lt;contract_address&gt;</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>Ambil daftar holder token.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api/v1/tokens/traders/&lt;network&gt;/&lt;contract_address&gt;</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>Ambil daftar trader token.</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>/api/v1/wallet/holdings/&lt;network&gt;/&lt;wallet_address&gt;</AR.Cell>
          <AR.Cell>GET</AR.Cell>
          <AR.Cell>Ambil daftar holdings untuk wallet address.</AR.Cell>
        </AR.Row>
      </AR.Table>

      <AR.H2>DEX API</AR.H2>

      <AR.P>
        Untuk dokumentasi detail endpoint <code>/api/v1/dex</code> / <code>/api/dex</code> (parameter,
        supported chain/DEX, dan contoh request), lihat section berikut.
      </AR.P>

      <AR.Links links={[{ href: '/docs/developer/dex-api', text: 'DEX API', icon: <IconCode /> }]} />

      <AR.Navigation prevHref="/docs" prev="Index" nextHref="/docs/developer/dex-api" next="DEX API" />
    </>
  )
}
