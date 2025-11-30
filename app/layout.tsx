import { Titillium_Web, Source_Code_Pro } from 'next/font/google'

import { settings } from '@/config/settings'
import { LayoutRoot } from './LayoutRoot'

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

const RootLayout = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <html lang="en" style={{ fontFamily: fontTitilliumWeb.style.fontFamily }}>
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
        <LayoutRoot>{children}</LayoutRoot>
      </body>
    </html>
  )
}

export default RootLayout
