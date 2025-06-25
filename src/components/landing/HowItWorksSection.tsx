// src/components/landing/HowItWorksSection.tsx
import React from 'react';
import { Video, UploadCloud, BarChart2 } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      title: '1. Record Your Lift',
      description: 'Take a video of your exercise set from a clear angle, just as you normally would.',
      icon: Video
    },
    {
      title: '2. Upload to Argus',
      description: 'Select your video file and provide a few basic details like the weight used for the exercise.',
      icon: UploadCloud
    },
    {
      title: '3. Get Your Analysis',
      description: 'Our AI analyzes your video in moments, providing you with detailed scores and visual feedback.',
      icon: BarChart2
    }
  ];

  return (
    <section className="py-20 md:py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get Started in Three Simple Steps
          </h2>
          <p className="text-gray-400 mb-16">
            From recording to results, our process is designed to be fast and seamless.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-center h-16 w-16 mx-auto mb-6 bg-slate-800 rounded-full border-2 border-blue-500">
                <step.icon className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;