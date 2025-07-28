import type { Metadata, Viewport } from 'next'

import { Toaster } from 'react-hot-toast'

import { QueryProviders } from '@/providers/query-provider'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Asva Labs Assessment',
    template: '%s | Asva Labs Assessment'
  }
}

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: 'device-width'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProviders>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                color: '#fff',
                background: '#363636'
              }
            }}
          />
        </QueryProviders>
      </body>
    </html>
  )
}
