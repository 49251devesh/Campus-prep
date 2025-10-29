import React, { useState } from 'react';
import { UserRole } from '../types';
import { signUpWithEmailPassword, signInWithEmailPassword, signInAsAdmin } from '../services/firebaseService';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmailPassword(email, password);
      } else {
        await signInWithEmailPassword(email, password);
      }
      // On successful auth, the onAuthStateChanged listener in App.tsx will handle the redirect.
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleAdminLogin = async () => {
      setIsLoading(true);
      setError(null);
      try {
          await signInAsAdmin();
      } catch (err) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
          setIsLoading(false);
      }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">CampusPrep</h1>
          <p className="mt-2 text-lg text-gray-500">
            {isSignUp ? 'Create your student account' : 'Welcome Back, Student!'}
          </p>
        </div>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword"  className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="font-medium text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
        
        <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">OR</span>
            </div>
        </div>

        <button
            onClick={handleAdminLogin}
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300"
        >
            {isLoading ? 'Processing...' : 'Continue as Administrator'}
        </button>

      </div>
    </div>
  );
};

export default AuthForm;
