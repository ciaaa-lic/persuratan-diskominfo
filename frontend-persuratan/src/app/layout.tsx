import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';

const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'e-Surat DISKOMINFO | Sistem Manajemen Persuratan & Penomoran Resmi',
  description: 'Sistem penomoran, rekapitulasi, dan manajemen persuratan resmi Dinas Komunikasi dan Informatika berbasis web SaaS modern.',
};

import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
