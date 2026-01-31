import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { PageDexApiSupported } from './PageDexApiSupported'

export const metadata: Metadata = {
  title: `Supported Chains & DEXs | ${settings.title}`,
  description: settings.description
}

export default function Page(): JSX.Element {
  return <PageDexApiSupported />
}
