import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { Hr } from '@/components'

export const metadata: Metadata = {
  title: `Community Resources | ${settings.title}`,
  description: settings.description
}

export default (): JSX.Element => {
  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <h2 className="font-header text-size-6 text-primary-main-4">Crypto Resources</h2>
      <p className="text-size-4 text-primary-main-2">
        Kumpulan link, tooling, dan referensi untuk riset crypto (placeholder).
      </p>

      <Hr />

      <section className="flex flex-col gap-3">
        <h3 className="font-header text-size-5 text-primary-main-4">Yang akan ditambahkan</h3>
        <ul>
          <li>Explorer & analytics</li>
          <li>Indexers & data providers</li>
          <li>Security tooling</li>
          <li>Learning resources</li>
        </ul>
      </section>
    </div>
  )
}
