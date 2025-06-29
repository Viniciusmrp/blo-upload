// src/components/landing/TopNavigationBar.tsx (Modified)
"use client"; // Add this line

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { User } from 'lucide-react'; // Import User icon

const TopNavigationBar = () => {
  const { currentUser } = useAuth(); // Get the current user
  const logoSrc = "/logo-white.svg";

  return (
    <header className="bg-slate-800/50 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div>
          <Link href="/">
            <Image
              src={logoSrc}
              alt="Argus Logo"
              width={150}
              height={50}
              priority
            />
          </Link>
        </div>
        <div className="space-x-6 hidden md:flex items-center">
          <Link href="/#features" className="text-gray-300 hover:text-white">Features</Link>
          <Link href="/#about" className="text-gray-300 hover:text-white">About</Link>
        </div>
        <div>
          {currentUser ? (
            <Link href="/dashboard" className="flex items-center space-x-2 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out bg-gray-700 hover:bg-gray-600">
                <User className="h-5 w-5" />
                <span>Dashboard</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out">
              Try Now
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};
export default TopNavigationBar;