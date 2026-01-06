'use client'

import { LayoutContent, Nav } from '@/components'

type LayoutDeveloperProps = {
  children?: React.ReactNode
}

const LayoutDeveloper = (props: LayoutDeveloperProps): JSX.Element => {
  const { children } = props
  return (
    <LayoutContent left={<Nav className="mb-auto" path="docs" />}>
      <article className="flex flex-col min-w-0 min-h-0 prose prose-sm lg:prose-base">{children}</article>
    </LayoutContent>
  )
}

export default LayoutDeveloper
