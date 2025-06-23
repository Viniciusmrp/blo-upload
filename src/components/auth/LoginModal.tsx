"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FirebaseError } from 'firebase/app';
import { Oval } from 'react-loader-spinner';

const LoginModal = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      // On successful login/signup, the onAuthStateChanged in AuthContext will handle the rest.
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(err.message.replace('Firebase: ', ''));
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {isLoginView ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-center text-gray-400 mb-6">
          {isLoginView ? 'Sign in to access your dashboard.' : 'Sign up to start analyzing your exercises.'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 p-3 focus:ring-2 focus:ring-blue-500 transition"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password"className="text-sm font-medium text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 p-3 focus:ring-2 focus:ring-blue-500 transition"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition h-12"
          >
            {loading ? <Oval height={24} width={24} color="white" secondaryColor='gray' /> : (isLoginView ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-semibold text-blue-400 hover:text-blue-500 ml-2">
            {isLoginView ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;