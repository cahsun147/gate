import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { PageDeveloper } from './PageDeveloper'

export const metadata: Metadata = {
  title: `Developer | ${settings.title}`,
  description: settings.description
}

export default PageDeveloper
