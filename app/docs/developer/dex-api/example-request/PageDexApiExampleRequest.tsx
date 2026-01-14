'use client'

import { AR } from '@/components'

const PageDexApiExampleRequest = (): JSX.Element => {
  return (
    <>
      <AR.Header>Example Request</AR.Header>

      <AR.P>
        Below are examples of how to request the <code>/api/v1/dex</code> endpoint.
      </AR.P>

      <AR.H2>Trendingscore</AR.H2>

      <AR.P>
        The <code>trendingscore</code> query parameter controls the trending window used by the backend.
        Valid values:
      </AR.P>

      <AR.UL>
        <li>
          <code>m5</code>
        </li>
        <li>
          <code>h1</code>
        </li>
        <li>
          <code>h6</code>
        </li>
        <li>
          <code>h24</code>
        </li>
      </AR.UL>

      <AR.P>
        Optional filters:
      </AR.P>

      <AR.Table minWidth="48rem" className="not-prose">
        <AR.Row>
          <AR.Cell isHeader>Parameter</AR.Cell>
          <AR.Cell isHeader>Description</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>chainId</code>
          </AR.Cell>
          <AR.Cell>Filter by chain (must be supported).</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>dexId</code>
          </AR.Cell>
          <AR.Cell>Filter by DEX (depends on <code>chainId</code>).</AR.Cell>
        </AR.Row>
        <AR.Row>
          <AR.Cell>
            <code>trendingscore</code>
          </AR.Cell>
          <AR.Cell>Trending window. Default is typically <code>h6</code>.</AR.Cell>
        </AR.Row>
      </AR.Table>

      <AR.H2>Screener Mode (All Networks)</AR.H2>

      <AR.CodeBlock
        filename="GET /api/v1/dex"
        lang="bash"
        code={`curl "https://your-domain.com/api/v1/dex?trendingscore=h6"`}
      />

      <AR.CodeBlock
        filename="JavaScript (fetch)"
        lang="javascript"
        code={`const url = 'https://your-domain.com/api/v1/dex?trendingscore=h6';
const res = await fetch(url);
const data = await res.json();
console.log(data);`}
      />

      <AR.CodeBlock
        filename="Python (requests)"
        lang="python"
        code={`import requests

url = 'https://your-domain.com/api/v1/dex'
params = { 'trendingscore': 'h6' }

res = requests.get(url, params=params, timeout=30)
print(res.json())`}
      />

      <AR.CodeBlock
        filename="PowerShell (Invoke-RestMethod)"
        lang="powershell"
        code={`$url = 'https://your-domain.com/api/v1/dex?trendingscore=h6'
Invoke-RestMethod -Method GET -Uri $url`}
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
