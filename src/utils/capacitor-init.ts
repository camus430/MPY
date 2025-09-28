import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

export const initializeCapacitor = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Running in browser mode');
    return;
  }

  console.log('Initializing Capacitor for native platform:', Capacitor.getPlatform());

  try {
    // Configure status bar for dark theme
    if (Capacitor.isPluginAvailable('StatusBar')) {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#000000' });
    }

    // Handle app state changes for background audio
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
      
      if (!isActive) {
        // App went to background - audio should continue playing
        console.log('App backgrounded - maintaining audio session');
      } else {
        // App came to foreground
        console.log('App foregrounded');
      }
    });

    // Handle URL opens (deep links)
    App.addListener('appUrlOpen', ({ url }) => {
      console.log('App opened with URL:', url);
      // Handle deep links here if needed
    });

    // Handle app restoration
    App.addListener('appRestoredResult', ({ pluginId, methodName, data }) => {
      console.log('App restored:', { pluginId, methodName, data });
    });

    console.log('Capacitor initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Capacitor:', error);
  }
};