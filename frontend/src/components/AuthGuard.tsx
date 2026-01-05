import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = need login, false = redirect if logged in
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, error } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check

    if (requireAuth) {
      // Protected route - need login
      if (error || !user) {
        localStorage.removeItem('token');
        setLocation('/login');
        return;
      }
    } else {
      // Public route (like login) - redirect if already logged in
      if (user && !error) {
        setLocation('/dashboard');
        return;
      }
    }
  }, [user, isLoading, error, requireAuth, setLocation]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For protected routes, only show if authenticated
  if (requireAuth && (error || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // For public routes, only show if not authenticated
  if (!requireAuth && user && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}