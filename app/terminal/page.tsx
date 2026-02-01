import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { Terminal } from './Terminal'

export const metadata: Metadata = {
  title: `Terminal | ${settings.title}`,
  description: settings.description
}

export default (): JSX.Element => <Terminal />
