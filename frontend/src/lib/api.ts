const API_BASE_URL = 'http://localhost:4000/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  responseCode: string;
  data?: T;
  error?: string;
  timestamp: string;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data.data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Customer/Profile endpoints
  async getCustomer(customerId: string) {
    const response = await this.request<{
      customer: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        isEmailVerified: boolean;
        createdAt: string;
        about?: string;
        location?: string;
        services?: string; // JSON string from backend
        avatar?: string;
      };
      vehicles: any[];
    }>(`/customers/${customerId}`);
    
    // Parse services JSON string to array
    if (response.customer.services) {
      try {
        (response.customer as any).services = JSON.parse(response.customer.services);
      } catch {
        (response.customer as any).services = [];
      }
    } else {
      (response.customer as any).services = [];
    }
    
    return response;
  }

  async updateCustomer(customerId: string, data: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    about?: string;
    location?: string;
    services?: string[];
    avatar?: string;
  }) {
    // Convert services array to JSON string for backend
    const updateData = {
      ...data,
      services: data.services ? JSON.stringify(data.services) : undefined
    };
    
    return this.request<{
      customer: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        about?: string;
        location?: string;
        services?: string[];
        avatar?: string;
      };
    }>(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async changePassword(customerId: string, oldPassword: string, newPassword: string) {
    return this.request<{ message: string }>(`/customers/${customerId}/change-password`, {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // Auth endpoints
  async login(emailOrPhone: string, password: string) {
    return this.request<{
      customer: {
        id: string;
        fullName: string;
        email: string;
        isEmailVerified: boolean;
      };
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password }),
    });
  }

  // Orders endpoints
  async getOrders(customerId?: string, status?: string) {
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    if (status) params.append('status', status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/orders${query}`);
  }

  // Notifications endpoints
  async getNotifications(customerId: string) {
    return this.request<{
      notifications: Array<{
        id: string;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
        createdAt: string;
      }>;
    }>(`/notifications/customer/${customerId}`);
  }

  // Wallet endpoints
  async getWallet(driverId: string) {
    return this.request<{
      balance: number;
      currency: string;
    }>(`/wallet/driver/${driverId}`);
  }

  async getTransactions(driverId: string) {
    return this.request<Array<{
      id: string;
      type: string;
      amount: number;
      description: string;
      createdAt: string;
    }>>(`/transactions/driver/${driverId}`);
  }
}

export const apiService = new ApiService();
export { API_BASE_URL };