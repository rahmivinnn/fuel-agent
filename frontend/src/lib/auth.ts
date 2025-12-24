// Authentication utilities for managing user session
export const auth = {
  // Get stored auth token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  // Get current user data
  getUser() {
    const customerId = localStorage.getItem('customerId');
    const customerEmail = localStorage.getItem('customerEmail');
    const customerName = localStorage.getItem('customerName');
    
    if (!customerId) return null;
    
    return {
      id: customerId,
      email: customerEmail,
      name: customerName
    };
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!localStorage.getItem('customerId');
  },

  // Store user session after login
  setSession(userData: any, token: string) {
    localStorage.setItem('customerId', userData.id);
    localStorage.setItem('customerEmail', userData.email);
    localStorage.setItem('customerName', userData.fullName);
    localStorage.setItem('authToken', token);
  },

  // Clear user session (logout)
  clearSession() {
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('customerName');
    localStorage.removeItem('authToken');
    localStorage.removeItem('driverId');
  },

  // Get authorization header for API calls
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};