'use client';

import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext'; // ---- ADD THIS IMPORT ----

const TopNavigationBar = () => {
  const { user, logOut } = useAuthContext(); // ---- USE THE CONTEXT ----

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white">
          Your App
        </Link>
        <div className="flex items-center">
          {user ? (
            // ---- IF LOGGED IN, SHOW THIS ----
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 hidden sm:block">{user.email}</span>
              <button
                onClick={logOut}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          ) : (
            // ---- IF LOGGED OUT, SHOW THIS ----
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default TopNavigationBar;