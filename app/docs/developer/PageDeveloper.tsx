'use client'

import { Code as IconCode, X } from 'iconoir-react'

import { AR } from '@/components'

const PageDeveloper = (): JSX.Element => {
  return (
    <>
      <AR.Header>Developer</AR.Header>

      <AR.P>
        XGATE.FUN provides simple API documentation to help you optimize your trading. Please note that
        this system is still under active development and may contain limitations.
      </AR.P>

      <AR.P>Get started with the Developer docs:</AR.P>

      <AR.Links
        compact
        links={[
          { href: '/docs/developer/overview', text: 'Overview', icon: <IconCode /> },
          { href: '/docs/developer/dex-api', text: 'DEX API', icon: <IconCode /> },
          { href: '/docs/developer/dex-api/supported', text: 'Supported Chains & DEXs', icon: <IconCode /> },
          { href: '/docs/developer/dex-api/example-request', text: 'Example Request', icon: <IconCode /> }
        ]}
      />

      <AR.H2>Deliverables</AR.H2>

      <AR.P>
        This API is useful for both community and personal use. If you have a high-quality DEX data
        source or any tools that could help improve the XGATE community, please reach out.
      </AR.P>

      <AR.H2>Contact</AR.H2>

      <AR.P>
        Contact me on X:{' '}
        <a
          className="brightness-[0.8] transition-all ease-out duration-200 hover:brightness-100"
          href="https://x.com/styra0x"
          target="_blank"
          rel="noreferrer"
          title="Contact on X"
        >
          <X />
        </a>
      </AR.P>

      <AR.Navigation prevHref="/docs" prev="Index" nextHref="/docs/developer/overview" next="Overview" />
    </>
  )
}

export { PageDeveloper }
