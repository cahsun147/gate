'use client'

import { Code as IconCode } from 'iconoir-react'

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
          { href: '/docs/developer/dex-api/supported', text: 'Chains & DEXs', icon: <IconCode /> },
          { href: '#', text: 'Example Request', icon: <IconCode /> }
        ]}
      />

      <AR.H2>Deliverables</AR.H2>

      <AR.P>
        API ini berguna untuk komunitas maupun personal. Saya sangat berharap jika ada yang memiliki
        sumber data DEX yang bagus atau tools apapun yang dapat membantu meningkatkan kualitas
        komunitas XGATE silakan hubungi
        <a
          className="inline-flex items-center align-middle ml-2 brightness-[0.8] transition-all ease-out duration-200 hover:brightness-100"
          href="https://x.com/styra0x"
          target="_blank"
          rel="noreferrer"
        >
          <img
            className="!m-0"
            src="https://img.shields.io/twitter/follow/styra0x?style=social"
            alt="Follow styra0x on X"
          />
        </a>
      </AR.P>

      <AR.Navigation prevHref="/docs" prev="Index" nextHref="/docs/developer/overview" next="Overview" />
    </>
  )
}

export { PageDeveloper }
