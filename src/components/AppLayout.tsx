"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Home, UploadCloud, ListChecks, Settings, ChevronDown, Bell, UserCircle } from 'lucide-react';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <a
      href="#"
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors duration-150 ease-in-out
                  ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </a>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [activePage, setActivePage] = useState<string>('Home'); // This state will now only affect sidebar active item
  // const userName = "Vinicius Perez"; // No longer used if header is removed

  return (
    <div className="flex h-screen bg-slate-900 text-gray-100 font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 space-y-6 border-r border-gray-700 flex flex-col">
        {/* Logo Image */}
        <div className="flex justify-center items-center mb-6">
          <Image
            src="/logo-white.svg"   // IMPORTANT: Ensure this path is correct for your white SVG logo
            alt="Argus Platform Logo"
            width={180}             // Adjust width as needed
            height={60}             // Adjust height as needed
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              <NavItem
                icon={Home}
                label="Home"
                isActive={activePage === 'Home'}
                onClick={() => setActivePage('Home')}
              />
            </li>
            <li>
              <NavItem
                icon={UploadCloud}
                label="Upload"
                isActive={activePage === 'Upload'}
                onClick={() => setActivePage('Upload')}
              />
            </li>
            <li>
              <NavItem
                icon={ListChecks}
                label="Sessions Management"
                isActive={activePage === 'Sessions'}
                onClick={() => setActivePage('Sessions')}
              />
            </li>
          </ul>
        </nav>

        {/* Settings at the bottom */}
        <div>
          <ul>
            <li>
              <NavItem
                icon={Settings}
                label="Settings"
                isActive={activePage === 'Settings'}
                onClick={() => setActivePage('Settings')}
              />
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content Area - Header removed */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
