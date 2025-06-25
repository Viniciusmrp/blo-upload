// app/page.tsx
import TopNavigationBar from '@/components/landing/TopNavigationBar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection'; // Import the new section
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
        <HowItWorksSection /> {/* Add the new section here */}
      </main>
      <Footer />
    </div>
  );
}