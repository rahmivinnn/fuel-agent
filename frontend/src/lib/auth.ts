// JWT Token Management
export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem('token');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};

// Session Management
export const auth = {
  setSession: (user: any, token: string) => {
    authStorage.setToken(token);
    localStorage.setItem('fuelFriendId', user.id);
    localStorage.setItem('fuelFriendEmail', user.email);
    localStorage.setItem('fuelFriendName', user.fullName);
  },
  
  clearSession: () => {
    authStorage.removeToken();
    localStorage.removeItem('fuelFriendId');
    localStorage.removeItem('fuelFriendEmail');
    localStorage.removeItem('fuelFriendName');
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