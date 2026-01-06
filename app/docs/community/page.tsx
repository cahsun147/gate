import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: `Community | ${settings.title}`,
  description: settings.description
}

export default (): never => redirect('/docs/community/apps')
