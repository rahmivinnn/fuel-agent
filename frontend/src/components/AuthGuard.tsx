import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const driverId = localStorage.getItem('driverId');
    const customerName = localStorage.getItem('customerName') || localStorage.getItem('driverName');

    const isAuthenticated = token && driverId && customerName;
    const isAuthPage = ['/login', '/register', '/email-verification', '/verify-code', '/verify-success', '/face-verification', '/whatsapp-verification', '/verify-whatsapp-code', '/whatsapp-login'].includes(location);
    const isLandingPage = location === '/';
    const isProtectedPage = !isAuthPage && !isLandingPage;

    if (isAuthenticated && (isAuthPage || isLandingPage)) {
      setLocation('/dashboard');
    } else if (!isAuthenticated && isProtectedPage) {
      setLocation('/login');
    }
  }, [location, setLocation]);

  return <>{children}</>;
}