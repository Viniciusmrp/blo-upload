"use client";

import React from 'react'; // Removed useState as activePage state is no longer managed here
import Image from 'next/image';
import Link from 'next/link'; // Import Link
import { usePathname } from 'next/navigation'; // Import usePathname
import { Home, UploadCloud, ListChecks, Settings } from 'lucide-react'; // Removed unused icons for this component

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string; // href is now mandatory
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href }) => {
  const pathname = usePathname(); // Get current path
  const isActive = pathname === href || (href === "/dashboard" && pathname.startsWith("/dashboard/analysis")); // Adjust active logic if /dashboard shows analysis

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
  // const userName = "Vinicius Perez"; // No longer used

  return (
    <div className="flex h-screen bg-slate-900 text-gray-100 font-inter"> {/* Ensure font-inter is globally applied or added here if needed */}
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 space-y-6 border-r border-gray-700 flex flex-col">
        {/* Logo Image */}
        <div className="flex justify-center items-center mb-6">
          <Link href="/dashboard"> {/* Logo links to dashboard home */}
              <Image
                src="/logo-white.svg"
                alt="Argus Platform Logo"
                width={180}
                height={60}
                priority
              />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              {/* Assuming /dashboard shows ExerciseAnalysis or a general dashboard home */}
              <NavItem
                icon={Home}
                label="Home"
                href="/dashboard"
              />
            </li>
            <li>
              <NavItem
                icon={UploadCloud}
                label="Upload"
                href="/dashboard/upload" // New route for upload page
              />
            </li>
            <li>
              <NavItem
                icon={ListChecks}
                label="Sessions Management"
                href="/dashboard/sessions" // Placeholder - create this page later
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
                href="/dashboard/settings" // Placeholder - create this page later
              />
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;