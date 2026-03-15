import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.propertylog.app',
  appName: 'PropertyLog',
  webDir: 'out', // Next.js standard export directory
  server: {
    url: "https://propertylog.vercel.app/",
    cleartext: true
  }
};

export default config;