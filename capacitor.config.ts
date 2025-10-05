import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.15fb09dd2ba14153b63e95ea753a6837',
  appName: 'mon-petit-youtube',
  webDir: 'dist',
  server: {
    url: 'https://15fb09dd-2ba1-4153-b63e-95ea753a6837.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    },
    App: {
      launchUrl: 'https://15fb09dd-2ba1-4153-b63e-95ea753a6837.lovableproject.com?forceHideBadge=true'
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#000000',
    allowsBackForwardNavigationGestures: true
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true,
    captureInput: true,
    useLegacyBridge: false,
    hideLogs: false,
    // Empêcher la pause en arrière-plan
    webContentsDebuggingEnabled: true
  }
};

export default config;