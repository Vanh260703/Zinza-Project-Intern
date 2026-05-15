import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/src/context/AuthContext'

export const metadata: Metadata = {
  title: 'TruyệnHay - Kho truyện chữ hàng đầu Việt Nam',
  description: 'Đọc truyện chữ online miễn phí',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
