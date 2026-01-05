import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fuelfriendly.agent',
  appName: 'FuelFriendlyAgent',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '915622810812-n4f8t96hp3fbo2r46t4ti7unfnt4tupf.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
