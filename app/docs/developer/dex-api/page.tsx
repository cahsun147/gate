import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { PageDexApi } from './PageDexApi'

export const metadata: Metadata = {
  title: `DEX API | ${settings.title}`,
  description: settings.description
}

export default (): JSX.Element => <PageDexApi />
