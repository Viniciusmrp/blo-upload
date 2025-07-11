// src/app/layout.tsx
"use client";

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Inter } from 'next/font/google';

// This initializes the Inter font for your application.
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Links for all browsers and devices */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Fallback ICO for older browsers */}
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* Optional: Keep the SVG for modern browsers that prioritize it */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      
      {/* The AuthProvider is wrapped around the children, making the auth state 
          globally available to any client component in your application.
      */}
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}