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