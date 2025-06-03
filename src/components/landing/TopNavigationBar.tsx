// src/components/landing/TopNavigationBar.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const TopNavigationBar = () => {
  const logoSrc = "/logo-white.svg"; // Your white SVG logo in /public

  return (
    <header className="bg-slate-800/50 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div>
          <Link href="/">
            <Image
              src={logoSrc}
              alt="Argus Logo"
              width={150} // Adjust to your logo's aspect ratio
              height={50} // Adjust to your logo's aspect ratio
              priority
            />
          </Link>
        </div>
        <div className="space-x-6 hidden md:flex items-center">
          {/* Add more relevant links for your landing page later */}
          <Link href="/#features" className="text-gray-300 hover:text-white">Features</Link>
          <Link href="/#about" className="text-gray-300 hover:text-white">About</Link>
        </div>
        <div>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out">
            Try Now
          </Link>
        </div>
      </nav>
    </header>
  );
};
export default TopNavigationBar;