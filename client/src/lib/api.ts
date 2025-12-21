export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://api.kelolahrd.life');

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