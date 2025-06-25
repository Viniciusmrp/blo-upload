// src/components/landing/HeroSection.tsx
import React from 'react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="py-24 md:py-36 text-center bg-slate-900">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          AI-Powered Feedback For Every Rep
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Upload your exercise videos and get instant, data-driven analysis of your form, intensity, and performance. Argus helps you train smarter and reach your fitness goals faster.
        </p>
        <Link href="/dashboard/upload" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
          Analyze Your First Video
        </Link>
      </div>
    </section>
  );
};
export default HeroSection;