import { useEffect } from 'react';

export const useBackgroundPlayback = () => {
  useEffect(() => {
    // Configuration pour permettre la lecture en arrière-plan
    const enableBackgroundPlayback = () => {
      // Empêcher le navigateur de suspendre l'audio/vidéo
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
          console.log('Background play requested');
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
          console.log('Background pause requested');
        });
      }

      // Configuration pour maintenir l'activité en arrière-plan
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('Page cachée - maintien de la lecture');
          // Maintenir les éléments audio/vidéo actifs
          const videos = document.querySelectorAll('video, audio');
          videos.forEach((media: any) => {
            if (!media.paused) {
              media.setAttribute('data-was-playing', 'true');
            }
          });
        } else {
          console.log('Page visible à nouveau');
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
      // Cleanup si nécessaire
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