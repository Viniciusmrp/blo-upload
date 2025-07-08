"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UploadCloud, ListChecks, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './auth/LoginModal';
import { Oval } from 'react-loader-spinner'; // Import a loader

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === "/dashboard" && pathname.startsWith("/dashboard/analysis"));

  return (
    <Link href={href} legacyBehavior>
      <a
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors duration-150 ease-in-out
                    ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </a>
    </Link>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // FIXED: Consume the `loading` state from the context
  const { currentUser, loading } = useAuth();

  // Show a full-screen loader while the auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Oval height={80} width={80} color="#60A5FA" secondaryColor="#374151" />
      </div>
    );
  }

  // If not loading and no user, show the login modal
  if (!currentUser) {
    return <LoginModal />;
  }

  // If user is logged in, show the dashboard layout
  return (
    <div className="flex h-screen bg-slate-900 text-gray-100 font-inter">
      <aside className="w-64 bg-gray-800 p-6 space-y-6 border-r border-gray-700 flex flex-col">
        <div className="flex justify-center items-center mb-6">
          <Link href="/dashboard">
              <Image
                src="/logo-white.svg"
                alt="Argus Platform Logo"
                width={180}
                height={60}
                priority
              />
          </Link>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li><NavItem icon={Home} label="Home" href="/dashboard" /></li>
            <li><NavItem icon={UploadCloud} label="Upload" href="/dashboard/upload" /></li>
            <li><NavItem icon={ListChecks} label="Sessions Management" href="/dashboard/sessions" /></li>
          </ul>
        </nav>
        <div>
          <ul>
            <li><NavItem icon={Settings} label="Settings" href="/dashboard/settings" /></li>
          </ul>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;