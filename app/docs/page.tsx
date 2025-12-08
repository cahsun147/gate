import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { PageDocs } from './PageDocs'

export const metadata: Metadata = {
  title: `Docs | ${settings.title}`,
  description: settings.description
}

export default (): JSX.Element => <PageDocs />
