/**
 * Root layout for the Next.js application.
 * Sets up metadata and wraps all pages with the client layout.
 */
import type { Metadata } from 'next';
import ClientLayout from './layout.client';
import './globals.css';

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
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
