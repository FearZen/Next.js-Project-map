import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Merchant Acquisition Map | Enterprise Field Marketing Tool',
  description:
    'Aplikasi operasional spasial untuk visualisasi, pemantauan status, dan perencanaan akuisisi merchant tim marketing lapangan.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
