'use client'

import { AR } from '@/components'

const PageDexApiExampleRequest = (): JSX.Element => {
  return (
    <>
      <AR.Header>Example Request</AR.Header>

      <AR.P>
        Below are example requests for the <code>/api/v1/dex</code> endpoint. Some older documentation
        uses the <code>/api/dex</code> alias.
      </AR.P>

      <AR.H2>Screener Mode (All Networks)</AR.H2>

      <AR.CodeBlock
        filename="GET /api/v1/dex"
        lang="bash"
        code={`curl "https://your-domain.com/api/v1/dex?trendingscore=h6"`}
      />

      <AR.H2>Screener Mode (Specific Network)</AR.H2>

      <AR.CodeBlock
        filename="GET /api/v1/dex?chainId=solana"
        lang="bash"
        code={`curl "https://your-domain.com/api/v1/dex?chainId=solana&trendingscore=h6"`}
      />

      <AR.CodeBlock
        filename="GET /api/v1/dex?chainId=ethereum"
        lang="bash"
        code={`curl "https://your-domain.com/api/v1/dex?chainId=ethereum&trendingscore=h6"`}
      />

      <AR.H2>Detail Mode</AR.H2>

      <AR.CodeBlock
        filename="GET /api/v1/dex/:network/:address"
        lang="bash"
        code={`curl "https://your-domain.com/api/v1/dex/solana/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr"`}
      />

      <AR.H2>Response Example (Screener Mode)</AR.H2>

      <AR.CodeBlock
        filename="200 OK"
        lang="json"
        code={`{
  "made by": "Xdeployments",
  "message": "ok",
  "data": {
    "pairs": []
  }
}`}
      />

      <AR.H2>Response Example (Detail Mode)</AR.H2>

      <AR.CodeBlock
        filename="200 OK"
        lang="json"
        code={`{
  "made by": "Xdeployments",
  "message": "ok",
  "data": []
}`}
      />

      <AR.Navigation
        prevHref="/docs/developer/dex-api/supported"
        prev="Supported"
        nextHref="/docs/developer/overview"
        next="Overview"
      />
    </>
  )
}

export { PageDexApiExampleRequest }
