import type { Metadata, Viewport } from 'next';
import { Baloo_2, Nunito } from 'next/font/google';
import { QueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/lib/auth-context';
import '@/styles/globals.css';

const display = Baloo_2({ subsets: ['latin', 'vietnamese'], variable: '--font-display' });
const body = Nunito({ subsets: ['latin', 'vietnamese'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'AI Academy — Học như chơi, Chơi mà học',
  description: 'Nền tảng giáo dục AI cá nhân hóa cho học sinh lớp 3-6',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#58CC02',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
