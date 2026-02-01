import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin', 'latin-ext'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f17' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'CompLab — Магазин компьютерной техники и сервисный центр',
    template: '%s | CompLab',
  },
  description:
    'Интернет-магазин компьютерной техники CompLab. Продажа компьютеров, ноутбуков, комплектующих. Профессиональный ремонт техники с гарантией.',
  keywords: [
    'компьютерный магазин',
    'ноутбуки',
    'комплектующие',
    'видеокарты',
    'ремонт компьютеров',
    'сервисный центр',
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CompLab',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-dvh bg-background font-sans antialiased no-pull-refresh`}
      >
        <div className="relative flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
