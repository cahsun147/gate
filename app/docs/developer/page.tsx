import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import OverviewPage from './overview/page'

export const metadata: Metadata = {
  title: `For Developer | ${settings.title}`,
  description: settings.description
}

export default OverviewPage
