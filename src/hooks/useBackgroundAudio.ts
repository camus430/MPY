import { useEffect, useRef, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface AudioMetadata {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
}

export const useBackgroundAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);

  // Initialize audio element with background playback capabilities
  const initializeAudio = (src: string, meta: AudioMetadata) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    
    // Essential for iOS background playback
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    
    audio.src = src;
    audioRef.current = audio;
    setMetadata(meta);

    // Audio event listeners
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      updateMediaSession(meta, audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('play', () => {
      setIsPlaying(true);
      if (Capacitor.isNativePlatform()) {
        // Keep app alive in background
        App.addListener('appStateChange', ({ isActive }) => {
          if (!isActive && audio && !audio.paused) {
            // App went to background while playing - continue playback
            console.log('App backgrounded, continuing audio playback');
          }
        });
      }
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    // Error handling
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    });

    return audio;
  };

  // Update Media Session API for lock screen controls and Dynamic Island
  const updateMediaSession = (meta: AudioMetadata, audioDuration?: number) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.title,
        artist: meta.artist,
        album: meta.album || 'Mon Petit YouTube',
        artwork: meta.artwork ? [
          { src: meta.artwork, sizes: '96x96', type: 'image/png' },
          { src: meta.artwork, sizes: '128x128', type: 'image/png' },
          { src: meta.artwork, sizes: '192x192', type: 'image/png' },
          { src: meta.artwork, sizes: '256x256', type: 'image/png' },
          { src: meta.artwork, sizes: '384x384', type: 'image/png' },
          { src: meta.artwork, sizes: '512x512', type: 'image/png' },
        ] : undefined,
      });

      // Set up action handlers for lock screen controls
      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(audioRef.current.currentTime - skipTime, 0);
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(
            audioRef.current.currentTime + skipTime,
            audioRef.current.duration
          );
        }
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      });

      // Update playback state for Dynamic Island
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      // Set position state for progress bar
      if (audioDuration) {
        navigator.mediaSession.setPositionState({
          duration: audioDuration,
          playbackRate: 1,
          position: currentTime,
        });
      }
    }
  };

  // Update position state when time changes
  useEffect(() => {
    if ('mediaSession' in navigator && duration > 0) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: currentTime,
      });
    }
  }, [currentTime, duration]);

  // Update playback state when play/pause changes
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const playAudio = async (src: string, meta: AudioMetadata) => {
    try {
      const audio = initializeAudio(src, meta);
      await audio.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
  };

  const resumeAudio = async () => {
    try {
      await audioRef.current?.play();
    } catch (error) {
      console.error('Failed to resume audio:', error);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    playAudio,
    pauseAudio,
    resumeAudio,
    seekTo,
    setVolume,
    isPlaying,
    currentTime,
    duration,
    metadata,
    audioElement: audioRef.current,
  };
};
