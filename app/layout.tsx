import { settings } from '@/config/settings'
import { LayoutRoot } from './LayoutRoot'
import Providers from '@/providers/providers'
import '@/components/globals.css'

const RootLayout = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />

        <meta property="og:title" content={settings.title} />
        <meta property="og:site_name" content={settings.title} />
        <meta property="og:description" content={settings.description} />
        <meta property="og:image" content="https://gate-ashy-iota.vercel.app/xgate.jpg" />
        <meta property="og:url" content="https://gate-ashy-iota.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:image:alt" content={settings.title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@styra0x" />

        <meta name="theme-color" content={settings.background} />
        <style>{`html, body { background: ${settings.background}; }`}</style>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
        <LayoutRoot>{children}</LayoutRoot>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
