import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.matax.app',
  appName: 'Matax',
  webDir: 'out',
  server: {
    url: 'https://matax-demo.netlify.app/', 
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e3a8a", // Matax Blue
      showSpinner: true,
    },
  }
};

export default config;
