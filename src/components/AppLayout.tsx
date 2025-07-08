'use client';
import TopNavigationBar from './landing/TopNavigationBar';
import { useAuthContext } from '@/context/AuthContext'; // We won't need this anymore but it's fine to leave

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext(); // This line is no longer strictly necessary here

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <TopNavigationBar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* ---- DELETE THE FOOTER SECTION BELOW ---- */}
      <footer className="bg-gray-800 p-4 text-center">
        {user ? (
          <p>Logged in as {user.email}</p>
        ) : (
          <p>Not logged in</p>
        )}
      </footer>
       {/* ---- END OF DELETION ---- */}
    </div>
  );
};

export default AppLayout;