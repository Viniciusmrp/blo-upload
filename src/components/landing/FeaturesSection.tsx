// src/components/landing/FeaturesSection.tsx
import React from 'react';
import { BarChart, Video, Zap, Clock, ShieldCheck, Target } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    { 
      title: "Instant AI Analysis", 
      description: "Get immediate, automated feedback on your exercise form and technique right after you upload your video.",
      icon: Video 
    },
    { 
      title: "Advanced Performance Metrics", 
      description: "Track key metrics like time under tension, intensity, volume, and an overall performance score for every set.",
      icon: BarChart 
    },
    { 
      title: "Intensity & TUT Scoring", 
      description: "Optimize your training with specific scores for intensity and Time Under Tension (TUT) to ensure every rep counts.",
      icon: Zap 
    },
  ];

  return (
    <section id="features" className="py-20 md:py-24 bg-slate-800">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Unlock Your True Potential
            </h2>
            <p className="text-gray-400 mb-12">
              Argus provides a comprehensive breakdown of your performance with cutting-edge analysis tools.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-900 p-8 rounded-xl shadow-lg border border-transparent hover:border-blue-500 transition-colors duration-300">
              <feature.icon className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeaturesSection;