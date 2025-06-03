// src/components/landing/Footer.tsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-gray-400 py-10 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} Argus. All Rights Reserved.</p>
      </div>
    </footer>
  );
};
export default Footer;