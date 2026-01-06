import type { ReactNode } from 'react'

import { LayoutContent, Nav } from '@/components'

type LayoutCommunityProps = {
  children?: ReactNode
}

const LayoutCommunity = (props: LayoutCommunityProps): JSX.Element => {
  const { children } = props
  return (
    <LayoutContent left={<Nav className="mb-auto" path="docs" />}>
      <article className="flex flex-col min-w-0 min-h-0 prose prose-sm lg:prose-base">{children}</article>
    </LayoutContent>
  )
}

export default LayoutCommunity
