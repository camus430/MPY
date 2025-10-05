import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NativeMediaPlayerProps {
  src: string;
  title: string;
  artist: string;
  thumbnail?: string;
  type: 'video' | 'audio';
  autoplay?: boolean;
  className?: string;
  loop?: boolean;
  onLoopChange?: (loop: boolean) => void;
  onEnded?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const NativeMediaPlayer: React.FC<NativeMediaPlayerProps> = ({
  src,
  title,
  artist,
  thumbnail,
  type,
  autoplay = false,
  className,
  loop = false,
  onLoopChange,
  onEnded,
  onPrevious,
  onNext
}) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLooping, setIsLooping] = useState(loop);
  const isMobile = useIsMobile();

  // Configuration pour la lecture en arrière-plan
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    // Configuration essentielle pour la lecture en arrière-plan mobile
    media.setAttribute('playsinline', 'true');
    media.setAttribute('webkit-playsinline', 'true');
    media.setAttribute('x-webkit-airplay', 'allow');
    media.setAttribute('controlslist', 'nodownload');
    media.preload = 'auto';
    media.volume = volume;
    
    // Prévenir la pause automatique en arrière-plan
    media.setAttribute('data-keep-playing', 'true');

    // Configuration Media Session API pour contrôles système
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album: 'Mon Petit YouTube',
        artwork: thumbnail ? [
          { src: thumbnail, sizes: '96x96', type: 'image/png' },
          { src: thumbnail, sizes: '192x192', type: 'image/png' },
          { src: thumbnail, sizes: '512x512', type: 'image/png' },
        ] : undefined,
      });

      // Gestionnaires d'actions pour les contrôles système
      navigator.mediaSession.setActionHandler('play', () => {
        media.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        media.pause();
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        media.currentTime = Math.max(media.currentTime - skipTime, 0);
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        media.currentTime = Math.min(media.currentTime + skipTime, media.duration);
      });

      // Contrôles précédent/suivant pour navigation entre vidéos
      if (onPrevious) {
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          onPrevious();
        });
      }

      if (onNext) {
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          onNext();
        });
      }
    }

    // Event listeners
    const handleLoadedMetadata = () => {
      setDuration(media.duration);
      if (autoplay) {
        media.play().catch(console.error);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
      // Mettre à jour la position pour Media Session
      if ('mediaSession' in navigator && media.duration) {
        navigator.mediaSession.setPositionState({
          duration: media.duration,
          playbackRate: media.playbackRate,
          position: media.currentTime,
        });
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    const handleEnded = () => {
      if (isLooping) {
        media.currentTime = 0;
        media.play().catch(console.error);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'none';
        }
        onEnded?.();
      }
    };

    // Gestionnaire pour maintenir la lecture en arrière-plan TOUJOURS
    const handleVisibilityChange = () => {
      if (document.hidden && !media.paused) {
        console.log('App en arrière-plan - maintien PERMANENT de la lecture');
        media.setAttribute('data-background-playing', 'true');
        media.setAttribute('data-keep-playing', 'true');
        
        // Forcer la lecture continue même en arrière-plan
        const playPromise = media.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.log('Lecture en arrière-plan maintenue');
          });
        }

        // Maintenir activement la lecture toutes les 3 secondes
        const keepPlayingInterval = setInterval(() => {
          if (media.paused && media.getAttribute('data-keep-playing') === 'true') {
            console.log('Relance de la lecture en arrière-plan');
            media.play().catch(() => {});
          }
        }, 3000);

        // Stocker l'intervalle pour le nettoyer plus tard
        (media as any)._keepPlayingInterval = keepPlayingInterval;
        
      } else if (!document.hidden) {
        console.log('App au premier plan');
        
        // Nettoyer l'intervalle de maintien
        if ((media as any)._keepPlayingInterval) {
          clearInterval((media as any)._keepPlayingInterval);
          delete (media as any)._keepPlayingInterval;
        }
        
        // S'assurer que la lecture continue
        if (media.getAttribute('data-background-playing') === 'true' && media.paused) {
          media.play().catch(() => {});
        }
        
        media.removeAttribute('data-background-playing');
      }
    };

    // Empêcher la pause automatique lors du changement d'onglet/app
    const preventAutoPause = (e: Event) => {
      if (document.hidden && media.getAttribute('data-keep-playing') === 'true') {
        console.log('Prévention de la pause automatique');
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Relancer automatiquement si pause inattendue en arrière-plan
    const handleUnexpectedPause = () => {
      if (document.hidden && media.getAttribute('data-keep-playing') === 'true') {
        console.log('Pause inattendue détectée - relance');
        setTimeout(() => {
          if (media.paused && document.hidden) {
            media.play().catch(() => {});
          }
        }, 100);
      }
    };

    // Event listeners
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);
    media.addEventListener('ended', handleEnded);
    media.addEventListener('pause', preventAutoPause, true);
    media.addEventListener('pause', handleUnexpectedPause);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Nettoyer l'intervalle de maintien
      if ((media as any)._keepPlayingInterval) {
        clearInterval((media as any)._keepPlayingInterval);
        delete (media as any)._keepPlayingInterval;
      }

      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
      media.removeEventListener('ended', handleEnded);
      media.removeEventListener('pause', preventAutoPause, true);
      media.removeEventListener('pause', handleUnexpectedPause);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [src, title, artist, thumbnail, volume, autoplay, isLooping, onEnded, onPrevious, onNext]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    const media = mediaRef.current;
    if (!media) return;

    try {
      if (isPlaying) {
        media.pause();
      } else {
        await media.play();
      }
    } catch (error) {
      console.error('Erreur de lecture:', error);
    }
  };

  const handleSeek = (value: number[]) => {
    const media = mediaRef.current;
    if (media && duration > 0) {
      media.currentTime = value[0];
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isMuted) {
      media.volume = volume;
      setIsMuted(false);
    } else {
      media.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const media = mediaRef.current;
    if (!media || type !== 'video') return;

    if (!isFullscreen) {
      if (media.requestFullscreen) {
        media.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleLoop = () => {
    const newLooping = !isLooping;
    setIsLooping(newLooping);
    onLoopChange?.(newLooping);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Lecteur média natif */}
      <div className="relative">
        {type === 'video' ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={src}
            className="w-full aspect-video bg-black"
            playsInline
            webkit-playsinline="true"
            poster={thumbnail}
          />
        ) : (
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={src}
              className="hidden"
              playsInline
              webkit-playsinline="true"
            />
            {thumbnail && (
              <img
                src={thumbnail}
                alt={title}
                className="w-32 h-32 rounded-lg object-cover"
              />
            )}
          </div>
        )}

        {/* Contrôles overlay pour vidéo */}
        {type === 'video' && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              size="icon"
              variant="ghost"
              className="h-16 w-16 text-white hover:bg-white/20"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="p-4 space-y-4">
        {/* Informations */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{artist}</p>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration || 100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Contrôles principaux */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              size="icon"
              variant={isLooping ? "default" : "ghost"}
              onClick={toggleLoop}
              title={isLooping ? "Désactiver la boucle" : "Activer la boucle"}
              className={cn(isLooping && "bg-primary text-primary-foreground hover:bg-primary/90")}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {!isMobile && (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.01}
                  className="w-20"
                />
              </div>
            )}

            {isMobile && (
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {type === 'video' && !isMobile && (
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NativeMediaPlayer;