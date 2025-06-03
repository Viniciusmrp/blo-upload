// src/components/landing/FeaturesSection.tsx
import React from 'react';
// import { Zap, BarChart2, ShieldCheck } from 'lucide-react'; // Example icons if you use them

const FeaturesSection = () => {
  // Placeholder for features
  const features = [
    { title: "Feature One", description: "Description for feature one." /* icon: Zap */ },
    { title: "Feature Two", description: "Description for feature two." /* icon: BarChart2 */ },
    { title: "Feature Three", description: "Description for feature three." /* icon: ShieldCheck */ },
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Our Features
        </h2>
        <p className="text-gray-400 text-center mb-12 md:mb-16 max-w-xl mx-auto">
          Discover the core advantages our platform offers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-800 p-6 rounded-xl shadow-lg">
              {/* feature.icon && <feature.icon className="h-12 w-12 text-blue-500 mx-auto mb-4" /> */}
              <h3 className="text-xl font-semibold text-white mb-2 text-center">{feature.title}</h3>
              <p className="text-gray-400 text-center text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeaturesSection;