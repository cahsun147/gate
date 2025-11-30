'use client'

import React, { type ReactNode } from 'react'
import { AnimatorGeneralProvider, BleepsProvider, Animator } from '@arwes/react'
import { Titillium_Web, Source_Code_Pro } from 'next/font/google'
import { IconoirProvider } from 'iconoir-react'
import { useAtom } from 'jotai'

import {
  iconProviderProps,
  animatorGeneralSettings,
  bleepsSettings,
  atomMotionEnabled,
  atomAudioEnabled,
  theme
} from '@/config'
import { Background, Header} from '@/components'

const fontTitilliumWeb = Titillium_Web({
  subsets: ['latin'],
  weight: ['300', '600'],
  preload: false
})

const fontSourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400'],
  preload: false
})

const LayoutRoot = (props: { children: ReactNode }): JSX.Element => {
  const [isMotionEnabled] = useAtom(atomMotionEnabled)
  const [isAudioEnabled] = useAtom(atomAudioEnabled)

  return (
    <IconoirProvider {...iconProviderProps}>
      <AnimatorGeneralProvider {...animatorGeneralSettings} disabled={!isMotionEnabled}>
        <BleepsProvider
          {...bleepsSettings}
          common={{ ...bleepsSettings.common, disabled: !isAudioEnabled }}
        >
          <div
            className="relative inset-0 overflow-hidden flex flex-col w-full h-full"
            suppressHydrationWarning
            style={{
              '--arwes-frames-bg-color': theme.colors.primary.main(9, { alpha: 0.15 }),
              '--arwes-frames-line-color': theme.colors.primary.main(9, { alpha: 0.8 }),
              '--arwes-frames-deco-color': theme.colors.primary.main(7, { alpha: 0.8 }),

              // Link `next/font` font families to TailwindCSS
              '--app-font-family-header': fontTitilliumWeb.style.fontFamily,
              '--app-font-family-body': fontTitilliumWeb.style.fontFamily,
              '--app-font-family-cta': fontTitilliumWeb.style.fontFamily,
              '--app-font-family-code': fontSourceCodePro.style.fontFamily,

              scrollbarWidth: 'thin',
              scrollbarColor: `${theme.colors.secondary.main(7)} transparent`
            } as React.CSSProperties}
          >
            {/* Background Layer - Behind everything */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              <Animator combine>
                <Background />
              </Animator>
            </div>

            {/* Content Layer - In front of background */}
            <div className="relative flex flex-col pointer-events-auto w-full h-full" style={{ zIndex: 10 }}>
              <Animator combine manager="sequence">
                <div className="relative flex-1 flex flex-col min-w-0 min-h-0">
                  <Animator combine>
                    <Header />
                  </Animator>

                  <div className="flex-1 flex min-w-0 min-h-0 overflow-auto">{props.children}</div>
                </div>
              </Animator>
            </div>
          </div>
        </BleepsProvider>
      </AnimatorGeneralProvider>
    </IconoirProvider>
  )
}

export { LayoutRoot }
