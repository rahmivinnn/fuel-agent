export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Request:', url);
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }
};

// Helper function to convert relative API paths to absolute
export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

// API Service class
export class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getCurrentUser() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }
    
    return response.json();
  }

  async getCustomer(customerId: string) {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch customer');
    }
    return response.json();
  }

  async updateCustomer(customerId: string, data: any) {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update customer');
    }
    return response.json();
  }

  async login(emailOrPhone: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailOrPhone, password }),
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    return response.json();
  }

  async register(data: any) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    return response.json();
  }
}

export const apiService = new ApiService();