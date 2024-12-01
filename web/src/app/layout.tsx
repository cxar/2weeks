import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { TopNav } from '@/components/nav/top-nav'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <TopNav />
          <main>
            {children}
          </main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}