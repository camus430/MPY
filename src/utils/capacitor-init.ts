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

    // Maintenir tous les éléments audio/vidéo actifs
    const keepMediaAlive = () => {
      const mediaElements = document.querySelectorAll('video, audio');
      mediaElements.forEach((media: any) => {
        if (!media.paused && media.getAttribute('data-keep-playing') === 'true') {
          // Forcer la lecture continue
          media.play().catch(() => {
            console.log('Maintien de la lecture en arrière-plan');
          });
        }
      });
    };

    // Handle app state changes for background audio
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
      
      if (!isActive) {
        // App went to background - maintain all active audio
        console.log('App backgrounded - maintaining audio session');
        
        // Marquer tous les médias actifs pour maintien en arrière-plan
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach((media: any) => {
          if (!media.paused) {
            media.setAttribute('data-was-playing', 'true');
            media.setAttribute('data-keep-playing', 'true');
          }
        });

        // Maintenir la lecture toutes les 5 secondes
        const keepAliveInterval = setInterval(keepMediaAlive, 5000);
        (window as any)._audioKeepAliveInterval = keepAliveInterval;
        
      } else {
        // App came to foreground
        console.log('App foregrounded');
        
        // Nettoyer l'intervalle
        if ((window as any)._audioKeepAliveInterval) {
          clearInterval((window as any)._audioKeepAliveInterval);
          delete (window as any)._audioKeepAliveInterval;
        }

        // Restaurer la lecture des médias qui jouaient
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach((media: any) => {
          if (media.getAttribute('data-was-playing') === 'true') {
            media.play().catch(() => {});
            media.removeAttribute('data-was-playing');
          }
        });
      }
    });

    // Empêcher la pause lors du passage en arrière-plan
    App.addListener('pause', () => {
      console.log('App pause event - maintaining playback');
      keepMediaAlive();
    });

    // Restaurer la lecture au retour
    App.addListener('resume', () => {
      console.log('App resume event - restoring playback');
      keepMediaAlive();
    });

    // Handle URL opens (deep links)
    App.addListener('appUrlOpen', ({ url }) => {
      console.log('App opened with URL:', url);
    });

    // Handle app restoration
    App.addListener('appRestoredResult', ({ pluginId, methodName, data }) => {
      console.log('App restored:', { pluginId, methodName, data });
    });

    console.log('Capacitor initialized successfully with background audio support');
  } catch (error) {
    console.error('Failed to initialize Capacitor:', error);
  }
};