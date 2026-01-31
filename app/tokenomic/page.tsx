import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { PageTokenomic } from './PageTokenomic'

export const metadata: Metadata = {
  title: `Tokenomic | ${settings.title}`,
  description: settings.description
}

export default function Page(): JSX.Element {
  return <PageTokenomic />
}
