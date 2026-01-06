import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { Card } from '@/components'
import { Page as IconPage } from 'iconoir-react'

export const metadata: Metadata = {
  title: `Community Projects | ${settings.title}`,
  description: settings.description
}

export default (): JSX.Element => {
  const projects = [
    {
      title: 'Crypto Screener',
      description: 'Daftar tools / dashboard untuk analisa token & market (coming soon).',
      href: '#'
    },
    {
      title: 'Onchain Data',
      description: 'Resource untuk data onchain, explorer, indexer, dan analytics (coming soon).',
      href: '#'
    },
    {
      title: 'Trading Tools',
      description: 'Bot / utility untuk trading dan monitoring (coming soon).',
      href: '#'
    }
  ]

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <h2 className="font-header text-size-6 text-primary-main-4">Crypto Projects</h2>

      <main className="grid grid-cols-1 gap-x-4 gap-y-8 mx-auto w-full max-w-screen-lg sm:grid-cols-2 md:grid-cols-3 md:gap-y-12">
        {projects.map((item, index) => (
          <a key={index} href={item.href} className="block">
            <Card title={item.title} description={item.description} icon={<IconPage />} />
          </a>
        ))}
      </main>
    </div>
  )
}
