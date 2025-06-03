// app/page.tsx
import TopNavigationBar from '@/components/landing/TopNavigationBar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
// Import other landing page sections as you create them
import Footer from '@/components/landing/Footer';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function LandingPage() {
  return (
    <div className={`flex flex-col min-h-screen bg-slate-900 text-gray-100 ${inter.className}`}>
      <TopNavigationBar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        {/* Add more sections here later */}
      </main>
      <Footer />
    </div>
  );
}