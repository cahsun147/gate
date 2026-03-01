export type FrameStyleVars = {
  '--arwes-frames-line-color'?: string
  '--arwes-frames-line-filter'?: string
  '--arwes-frames-bg-color'?: string
  '--arwes-frames-bg-stroke'?: string
  '--arwes-frames-bg-filter'?: string
  '--arwes-frames-deco-color'?: string
  '--arwes-frames-deco-filter'?: string
}

const getFrameStyleVarsFromDefaults = (defaults: {
  line?: {
    color?: string
    filter?: string
  }
  bg?: {
    color?: string
    stroke?: string
    filter?: string
  }
  deco?: {
    color?: string
    filter?: string
  }
}): FrameStyleVars => {
  return {
    '--arwes-frames-line-color': defaults.line?.color,
    '--arwes-frames-line-filter': defaults.line?.filter,
    '--arwes-frames-bg-color': defaults.bg?.color,
    '--arwes-frames-bg-stroke': defaults.bg?.stroke,
    '--arwes-frames-bg-filter': defaults.bg?.filter,
    '--arwes-frames-deco-color': defaults.deco?.color,
    '--arwes-frames-deco-filter': defaults.deco?.filter
  }
}

const mergeFrameStyleVars = (defaults: FrameStyleVars, override?: FrameStyleVars): FrameStyleVars => {
  return {
    ...(defaults ?? {}),
    ...(override ?? {})
  }
}

export { getFrameStyleVarsFromDefaults, mergeFrameStyleVars }
