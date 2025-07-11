// src/app/layout.tsx
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next'; // Import the Metadata type

const inter = Inter({ subsets: ['latin'] });

// Define your metadata object
export const metadata: Metadata = {
  title: 'Argus.fit', // This will be the default title for your tabs
  description: 'AI-Powered Feedback For Every Rep',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' }, // If you have an SVG icon
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Next.js will automatically add the <head> contents from your metadata */}
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}