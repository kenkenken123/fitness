import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../src/context/AuthContext' // 导入 AuthProvider
import BottomNavBar from '../components/BottomNavBar' // 导入 BottomNavBar

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider> {/* 添加 AuthProvider */}
          {children}
        </AuthProvider>
        <BottomNavBar />
      </body>
    </html>
  )
}