// JWT Token Management
export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem('jwt_token');
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('jwt_token', token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem('jwt_token');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('jwt_token');
  }
};

// Session Management
export const auth = {
  setSession: (user: any, token: string) => {
    authStorage.setToken(token);
    localStorage.setItem('customerId', user.id);
    localStorage.setItem('customerEmail', user.email);
    localStorage.setItem('customerName', user.fullName);
    localStorage.setItem('driverId', 'ff1'); // Default driver ID
  },
  
  clearSession: () => {
    authStorage.removeToken();
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('customerName');
    localStorage.removeItem('driverId');
  }
};

// API call with JWT token
export const apiCallWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = authStorage.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    auth.clearSession();
    window.location.href = '/login';
  }

  return response;
};