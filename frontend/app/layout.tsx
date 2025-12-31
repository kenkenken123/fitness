
import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../src/context/AuthContext'
import BottomNavBar from '../components/BottomNavBar'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '健身鸭',
  description: '您的贴身智能健身教练',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <BottomNavBar />
      </body>
    </html>
  )
}