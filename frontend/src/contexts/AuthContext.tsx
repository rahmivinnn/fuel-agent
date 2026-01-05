import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiCallWithAuth } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/auth/me`);
      
      if (!response.ok) {
        throw new Error('Failed to get user data');
      }
      
      const data = await response.json();
      setUser(data.data);
    } catch (err: any) {
      console.error('AuthContext: Error fetching user:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}