import { useEffect } from 'react';

export const useBackgroundPlayback = () => {
  useEffect(() => {
    let wakeLock: any = null;

    const enableBackgroundPlayback = async () => {
      // Configuration Media Session API pour contrôles système
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'Mon Petit YouTube',
          artist: 'Lecture en cours',
          artwork: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          const media = document.querySelector('video, audio') as HTMLMediaElement;
          if (media) media.play();
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
          const media = document.querySelector('video, audio') as HTMLMediaElement;
          if (media) media.pause();
        });

        navigator.mediaSession.setActionHandler('seekbackward', () => {
          const media = document.querySelector('video, audio') as HTMLMediaElement;
          if (media) media.currentTime = Math.max(media.currentTime - 10, 0);
        });

        navigator.mediaSession.setActionHandler('seekforward', () => {
          const media = document.querySelector('video, audio') as HTMLMediaElement;
          if (media) media.currentTime = Math.min(media.currentTime + 10, media.duration);
        });
      }

      // Acquérir le wake lock pour maintenir la session active
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Wake Lock activé pour lecture en arrière-plan');
        }
      } catch (err) {
        console.log('Wake Lock non disponible:', err);
      }

      // Gérer la visibilité pour maintenir la lecture
      document.addEventListener('visibilitychange', async () => {
        if (document.hidden) {
          console.log('App en arrière-plan - maintien de la lecture');
          const medias = document.querySelectorAll('video, audio');
          medias.forEach((media: any) => {
            if (!media.paused) {
              media.setAttribute('data-background-playing', 'true');
              // Forcer la lecture continue
              media.play().catch(() => {});
            }
          });
        } else {
          console.log('App au premier plan');
          // Réacquérir le wake lock si nécessaire
          if (wakeLock !== null && wakeLock.released && 'wakeLock' in navigator) {
            try {
              wakeLock = await (navigator as any).wakeLock.request('screen');
            } catch (err) {
              console.log('Impossible de réacquérir le wake lock');
            }
          }
        }
      });
    };

    enableBackgroundPlayback();

    // Configuration globale pour les iframes YouTube
    const configureYouTubeForBackground = () => {
      const style = document.createElement('style');
      style.textContent = `
        /* Force les vidéos à continuer en arrière-plan */
        iframe[src*="youtube.com"],
        iframe[src*="youtube-nocookie.com"] {
          background-color: transparent;
        }
        
        /* Maintenir l'audio actif */
        audio,
        video {
          background-color: transparent;
        }
      `;
      document.head.appendChild(style);
    };

    configureYouTubeForBackground();

    return () => {
      // Libérer le wake lock lors du nettoyage
      if (wakeLock !== null) {
        wakeLock.release().then(() => {
          console.log('Wake Lock libéré');
        });
      }
    };
  }, []);

  return {
    // Fonction pour configurer une vidéo spécifique pour l'arrière-plan
    configureVideoForBackground: (videoElement: HTMLVideoElement | HTMLIFrameElement) => {
      if (videoElement.tagName === 'IFRAME') {
        // Pour les iframes YouTube
        const iframe = videoElement as HTMLIFrameElement;
        const src = iframe.src;
        
        // Ajouter les paramètres pour maintenir la lecture en arrière-plan
        if (src.includes('youtube.com') && !src.includes('enablejsapi=1')) {
          const separator = src.includes('?') ? '&' : '?';
          iframe.src = `${src}${separator}enablejsapi=1&rel=0&modestbranding=1`;
        }
      } else {
        // Pour les éléments vidéo/audio natifs
        const video = videoElement as HTMLVideoElement;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        
        // Maintenir la lecture même quand la page est cachée
        video.addEventListener('pause', (e) => {
          if (document.hidden && video.getAttribute('data-user-paused') !== 'true') {
            // Si la pause n'est pas intentionnelle, relancer
            setTimeout(() => {
              if (document.hidden && !video.paused) {
                video.play().catch(console.log);
              }
            }, 100);
          }
        });
      }
    }
  };
};