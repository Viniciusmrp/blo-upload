'use client';
import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';

const LoginModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle } = useAuthContext(); // Get the new function
  const [error, setError] = useState('');

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await signIn(email, password);
    } catch (e) {
      setError('Invalid credentials. Please try again.');
      console.error(e);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (e: any) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError('Could not sign in with Google.');
      }
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-white w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
            Login
          </button>
        </form>

        <div className="my-4 flex items-center">
          <hr className="w-full border-gray-600" />
          <span className="px-2 text-gray-400 text-sm">OR</span>
          <hr className="w-full border-gray-600" />
        </div>

        {/* ---- THIS IS THE NEW BUTTON ---- */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center gap-2"
        >
          {/* You can find an SVG for the Google logo online to place here */}
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginModal;