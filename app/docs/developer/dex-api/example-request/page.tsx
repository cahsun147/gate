import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { PageDexApiExampleRequest } from './PageDexApiExampleRequest'

export const metadata: Metadata = {
  title: `DEX API Example Request | ${settings.title}`,
  description: settings.description
}

export default (): JSX.Element => <PageDexApiExampleRequest />
