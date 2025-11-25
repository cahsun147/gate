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
  settings,
  theme
} from '@/config'
import { Background, Header } from '@/components'

import '@/components/globals.css'

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

const RootLayout = ({ children }: { children: ReactNode }): JSX.Element => {
  const [isMotionEnabled] = useAtom(atomMotionEnabled)
  const [isAudioEnabled] = useAtom(atomAudioEnabled)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />

        <meta property="og:title" content={settings.title} />
        <meta property="og:site_name" content={settings.title} />
        <meta property="og:description" content={settings.description} />
        <meta property="og:image" content="/arwes.jpg" />
        <meta property="og:url" content="https://xgate.dev" />
        <meta property="og:type" content="website" />
        <meta name="twitter:image:alt" content={settings.title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@xgate" />

        <meta name="theme-color" content={settings.background} />
        <style>{`html, body { background: ${settings.background}; }`}</style>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body>
        <IconoirProvider {...iconProviderProps}>
          <AnimatorGeneralProvider {...animatorGeneralSettings} disabled={!isMotionEnabled}>
            <BleepsProvider
              {...bleepsSettings}
              common={{ ...bleepsSettings.common, disabled: !isAudioEnabled }}
            >
              <div
                className="absolute inset-0 overflow-hidden flex flex-col"
                style={{
                  // @ts-expect-error ARWES variables.
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
                }}
              >
                <Animator combine>
                  <Animator combine>
                    <Background />
                  </Animator>

                  <Animator combine manager="sequence">
                    <div className="relative flex-1 flex flex-col min-w-0 min-h-0">
                      <Animator combine>
                        <Header />
                      </Animator>

                      <div className="flex-1 flex min-w-0 min-h-0">{children}</div>
                    </div>
                  </Animator>
                </Animator>
              </div>
            </BleepsProvider>
          </AnimatorGeneralProvider>
        </IconoirProvider>
      </body>
    </html>
  )
}

export default RootLayout
