import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fuelfriend.app",
  appName: "FuelFriendPWA",
  webDir: "dist/public",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
  },
};

export default config;