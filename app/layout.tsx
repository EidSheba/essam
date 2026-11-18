import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

/*
 * The three fonts are bundled in ./fonts (variable fonts, Latin subset), so building and running the site
 * never depends on Google Fonts being reachable.
 */
const serif = localFont({
  src: [
    { path: './fonts/fraunces-normal-100-900.woff2', weight: '100 900', style: 'normal' },
    { path: './fonts/fraunces-italic-100-900.woff2', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-fofa-serif',
  display: 'swap',
})
const hand = localFont({ src: './fonts/caveat.woff2', weight: '400 700', variable: '--font-fofa-hand', display: 'swap' })
const sans = localFont({ src: './fonts/outfit.woff2', weight: '100 900', variable: '--font-fofa-sans', display: 'swap' })

export const metadata: Metadata = {
  title: 'Just for two',
  description: 'A private page.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { themeColor: '#1c0615' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${hand.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
