import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fuelfriend.app",
  appName: "FuelFriend Agent",
  webDir: "dist/public",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1046154702406-ihj0srffgt8j5undivf1q2g1bllsdqg3.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;