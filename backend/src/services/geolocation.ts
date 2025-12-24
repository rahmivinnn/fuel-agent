export async function checkLocation(ip: string): Promise<{ allowed: boolean; error?: string }> {
  // Mock geolocation check - always allow for development
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
    return { allowed: true };
  }
  
  // In production, implement actual IP geolocation
  try {
    // Mock response - replace with actual geolocation service
    const mockCountry = 'US'; // or 'UK'
    const allowedCountries = ['US', 'UK'];
    
    return {
      allowed: allowedCountries.includes(mockCountry)
    };
  } catch (error) {
    return {
      allowed: false,
      error: 'Geolocation check failed'
    };
  }
}