/**
 * Root layout for the Next.js application.
 * Sets up font, metadata, and wraps all pages with the client layout.
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from './layout.client';
import './globals.css';

// Inter font for consistent typography
const inter = Inter({ subsets: ['latin'] });

// Page metadata for SEO
export const metadata: Metadata = {
  title: 'Recovery Co.',
  description: 'Quality essentials, thoughtful design, fast shipping.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
