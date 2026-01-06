
'use client'

import { type ReactNode } from 'react'
import { LayoutContent, Nav } from '@/components'

const LayoutCommunity = (props: { children: ReactNode }): JSX.Element => {
  return (
    <LayoutContent left={<Nav className="mb-auto" path="docs" />}>
      <article className="flex flex-col min-w-0 min-h-0 prose prose-sm lg:prose-base">{props.children}</article>
    </LayoutContent>
  )
}

export { LayoutCommunity }
