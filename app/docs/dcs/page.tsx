import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import OverviewPage from './overview/page'

export const metadata: Metadata = {
  title: `DCS | ${settings.title}`,
  description: settings.description
}

export default OverviewPage
