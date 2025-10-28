"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [userExists, setUserExists] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  // Check for error from callback
  const authError = searchParams.get('error');

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.isOnboardingComplete) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, authLoading, router]);
  
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError("");
    
    // Use real WorkOS Google OAuth
    const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;
    
    if (!clientId) {
      setError('Google login not configured');
      setIsLoading(false);
      return;
    }

    // Redirect to WorkOS OAuth
    const redirectUri = `${window.location.origin}/api/auth/callback`;
    const workosAuthUrl = `https://api.workos.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `provider=google&` +
      `state=${encodeURIComponent(JSON.stringify({ provider: 'google' }))}`;

    window.location.href = workosAuthUrl;
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Clear client-side cookie as backup
      document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Force reload to clear any cached state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: just clear cookie and reload
      document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.reload();
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMagicLinkLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/magiclink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: magicLinkEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setMagicLinkSent(true);
        setUserExists(data.userExists || false);
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Magic link error:', err);
      setError('Failed to send verification code');
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: magicLinkEmail,
          code: verificationCode 
        })
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // Redirect based on onboarding status
        if (data.user.isOnboardingComplete) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/onboarding';
        }
      } else {
        setError(data.error || 'Invalid verification code');
        setIsVerifying(false);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Verification failed. Please try again.');
      setIsVerifying(false);
    }
  };


  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black rounded-2xl border border-gray-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <h1 className="text-3xl font-black text-white">Sahay</h1>
          </div>
          <p className="text-white text-lg">
            Welcome to your learning journey! 🚀
          </p>
          {user && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-xl">
              <p className="text-red-300 text-sm mb-3 font-semibold">
                ⚠️ Already logged in as: {user.email}
              </p>
              <p className="text-red-400 text-xs mb-3">
                You need to logout first to test the login flow
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                🚪 Logout & Test Login Flow
              </button>
            </div>
          )}
        </div>

        {/* Show auth error if present */}
        {authError && (
          <div className="mb-6 text-red-400 text-sm text-center bg-red-900/20 border border-red-800 p-3 rounded-xl">
            {authError === 'no_code' && 'Authentication failed. Please try again.'}
            {authError === 'auth_failed' && 'Authentication failed. Please try again.'}
          </div>
        )}

        {/* Google Login */}
        <div className="mb-6">
          <button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full hover:bg-white hover:!text-black font-semibold"
            isLoading={isLoading}
            icon={<span>🔍</span>}
          >
            Continue with Google
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-gray-400">or</span>
          </div>
        </div>

        {/* Magic Link Form */}
        {!magicLinkSent ? (
          <form onSubmit={handleMagicLink} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Email Address
              </label>
              <input
                type="email"
                required
                value={magicLinkEmail}
                onChange={(e) => setMagicLinkEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-4 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              variant="outline"
              className="w-full hover:bg-white hover:!text-black font-semibold"
              isLoading={isMagicLinkLoading}
              icon={<span>✉️</span>}
            >
              Continue with Email
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Check your email!
            </h3>
            <p className="text-gray-400 mb-6">
              {userExists ? (
                <>
                  We&apos;ve sent a verification code to <span className="text-white">{magicLinkEmail}</span> to log you in.
                </>
              ) : (
                <>
                  We&apos;ve sent a verification code to <span className="text-white">{magicLinkEmail}</span> to create your account.
                </>
              )}
            </p>
            
            <form onSubmit={handleCodeVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter the code from your email"
                  className="w-full px-4 py-4 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 p-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                variant="outline"
                className="w-full hover:bg-white hover:!text-black font-semibold"
                isLoading={isVerifying}
                icon={<span>🔐</span>}
              >
                Verify Code
              </button>
            </form>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => {
                  setMagicLinkSent(false);
                  setMagicLinkEmail("");
                  setVerificationCode("");
                }}
                className="text-gray-400 hover:text-white text-sm transition-colors block"
              >
                Try a different email
              </button>
              <button
                onClick={handleMagicLink}
                className="text-gray-400 hover:text-white text-sm transition-colors block"
              >
                Resend code
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Back to home
          </Link>
        </div>

      </div>
    </div>
  );
}
