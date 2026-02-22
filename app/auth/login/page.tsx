'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, ROLES } from '@/context/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, loading: authLoading, error: authError, isLoggedIn } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email, password);
      
      // Redirect all roles to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      // Error is handled by the auth context
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Call Engine</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display auth error */}
            {authError && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-300">
                {authError}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <p className="text-sm text-gray-600 text-center">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
              Sign up here
            </Link>
          </p>
          <p className="text-sm text-gray-600 text-center">
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              Back to Home
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
