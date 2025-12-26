import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { partnerAuthAPI } from '../services/api';
import logoUrl from '/BellaLogo.png';
import { toast } from 'react-hot-toast';

const PartnerForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await partnerAuthAPI.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <img src={logoUrl} alt="Bella Wash Logo" className='w-[150px] h-[150px]' />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Partner Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isSubmitted 
              ? "Check your email for instructions" 
              : "Enter your email and we'll send you a link to reset your password"}
          </p>
        </div>

        {isSubmitted ? (
          <div className="mt-8 bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 text-center">
            <div className="mb-4 text-green-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Check your mail</h3>
            <p className="text-sm text-gray-400 mb-6">
              We have sent a password reset link to <strong>{email}</strong>.
            </p>
            <div className="text-sm">
              <span className="text-gray-400">Did not receive the email? </span>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="font-medium text-orange-500 hover:text-orange-400 underline focus:outline-none"
              >
                Try again
              </button>
            </div>
            <div className="mt-6">
              <Link to="/partner-login" className="text-sm font-medium text-orange-500 hover:text-orange-400">
                &larr; Back to Partner Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6 bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-3 py-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  error ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="partner@example.com"
              />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center">
              <Link to="/partner-login" className="font-medium text-gray-400 hover:text-white text-sm">
                Return to Partner Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PartnerForgotPasswordPage;
