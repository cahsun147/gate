import type { Metadata } from 'next'

import { settings } from '@/config/settings'
import { PageXgateTutorial } from './PageXgateTutorial'

export const metadata: Metadata = {
  title: `XGATE Tutorial | ${settings.title}`,
  description: settings.description
}

export default function Page(): JSX.Element {
  return <PageXgateTutorial />
}
