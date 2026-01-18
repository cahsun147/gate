'use client'

import { AR } from '@/components'
import { Code as IconCode } from 'iconoir-react'

export default function Page(): JSX.Element {
  return (
    <>
      <AR.Header>Overview</AR.Header>

      <AR.P>
        Dokumentasi ini berisi informasi dasar untuk menggunakan API XGATE, termasuk hal-hal penting
        terkait penggunaan layanan, privasi, dan pertanyaan umum sebelum kamu mulai mengintegrasikan
        endpoint yang tersedia.
      </AR.P>

      <AR.Links links={[{ href: '/docs/developer/dex-api', text: 'DEX API', icon: <IconCode /> }]} />

      <AR.H2>Disclaimer</AR.H2>

      <AR.P>
        Informasi dan data yang disediakan oleh XGATE ditujukan untuk kebutuhan riset, komunitas, dan
        pengembangan. XGATE bukan penasihat keuangan, dan penggunaan data sepenuhnya menjadi
        tanggung jawab pengguna. Data dapat berubah, tertunda, atau tidak akurat tergantung kondisi
        jaringan dan penyedia sumber data.
      </AR.P>

      <AR.H2>Privacy Policy</AR.H2>

      <AR.P>
        XGATE tidak meminta ataupun menyimpan private key, seed phrase, atau kredensial sensitif.
        Permintaan API dapat tercatat dalam bentuk log teknis (misalnya IP, user-agent, waktu akses)
        untuk kebutuhan keamanan dan pemeliharaan layanan. Jika kamu memanggil API dari aplikasi kamu
        sendiri, pastikan kamu tidak mengirimkan data sensitif melalui query/body.
      </AR.P>

      <AR.H2>FAQ</AR.H2>

      <AR.H3>Does XGATE have a token?</AR.H3>

      <AR.P>
        Ya, XGATE memiliki token. Informasi resmi terkait jaringan, kontrak, utilitas, dan rencana
        pengembangan token akan diumumkan melalui kanal resmi. Mohon selalu verifikasi sumber sebelum
        berinteraksi dengan kontrak/token apa pun.
      </AR.P>

      <AR.H3>Where does XGATE get data from?</AR.H3>

      <AR.P>
        Data XGATE berasal dari data on-chain (langsung dari blockchain) dan beberapa penyedia API/data
        blockchain (misalnya RPC provider, explorer/indexer, dan layanan agregasi pasar). Untuk bagian
        tertentu seperti DEX trending, backend dapat mengambil data dari penyedia data DEX publik dan
        kemudian memprosesnya agar lebih mudah dipakai.
      </AR.P>

      <AR.Navigation prevHref="/docs" prev="Index" nextHref="/docs/developer/dex-api" next="DEX API" />
    </>
  )
}
