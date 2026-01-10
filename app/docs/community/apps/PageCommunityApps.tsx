'use client'

import { Animator, Text, cx } from '@arwes/react'
import { Page as IconPage } from 'iconoir-react'

import { Card } from '@/components'

type CommunityProject = {
  title: string
  description: string
  href: string
}

const projects: CommunityProject[] = [
  {
    title: 'Crypto Screener',
    description: 'Tools / dashboards for token and market analysis (coming soon).',
    href: '#'
  },
  {
    title: 'Onchain Data',
    description: 'Onchain data resources: explorers, indexers, and analytics (coming soon).',
    href: '#'
  },
  {
    title: 'Trading Tools',
    description: 'Bots / utilities for trading and monitoring (coming soon).',
    href: '#'
  }
]

const PageCommunityApps = (): JSX.Element => {
  return (
    <Animator combine manager="stagger" duration={{ stagger: 0.05 }}>
      <div className="flex flex-col gap-8 md:gap-12">
        <Animator>
          <Text as="h2" className="font-header text-size-6 text-primary-main-4" fixed>
            Crypto Projects
          </Text>
        </Animator>

        <main
          className={cx(
            'grid grid-cols-1 gap-x-4 gap-y-8 mx-auto w-full max-w-screen-lg',
            'sm:grid-cols-2',
            'md:grid-cols-3 md:gap-y-12'
          )}
        >
          {projects.map((item, index) => (
            <a key={index} href={item.href} className="block">
              <Card title={item.title} description={item.description} icon={<IconPage />} />
            </a>
          ))}
        </main>
      </div>
    </Animator>
  )
}

export { PageCommunityApps }
