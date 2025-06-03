// src/components/landing/HeroSection.tsx
import React from 'react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="py-24 md:py-36 text-center bg-slate-800">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Welcome to Argus Landing Page
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          This is where your Aikynetix-like landing page content will go.
        </p>
        <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-150 ease-in-out">
          Get Started
        </Link>
      </div>
    </section>
  );
};
export default HeroSection;