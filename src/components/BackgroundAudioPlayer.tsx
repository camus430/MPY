import React, { useEffect, useState } from 'react';
import { useBackgroundAudio } from '@/hooks/useBackgroundAudio';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface BackgroundAudioPlayerProps {
  videoData?: {
    title: string;
    creator: string;
    thumbnail: string;
    youtubeId: string;
    duration?: string;
  };
  className?: string;
}

const BackgroundAudioPlayer: React.FC<BackgroundAudioPlayerProps> = ({ 
  videoData, 
  className 
}) => {
  const isMobile = useIsMobile();
  const {
    playAudio,
    pauseAudio,
    resumeAudio,
    seekTo,
    setVolume,
    isPlaying,
    currentTime,
    duration,
    metadata,
  } = useBackgroundAudio();

  const [volume, setVolumeState] = useState(0.8);
  const [showPlayer, setShowPlayer] = useState(false);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start playing audio from YouTube video
  const startPlayback = async () => {
    if (!videoData) return;

    // Extract YouTube audio URL (this is a simplified approach)
    // In production, you'd want to use a proper YouTube audio extraction service
    const audioUrl = `https://www.youtube.com/watch?v=${videoData.youtubeId}`;
    
    try {
      await playAudio(audioUrl, {
        title: videoData.title,
        artist: videoData.creator,
        album: 'Mon Petit YouTube',
        artwork: videoData.thumbnail,
      });
      setShowPlayer(true);
    } catch (error) {
      console.error('Failed to start playback:', error);
      // Fallback: show a message or try alternative approach
    }
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  // Handle seek
  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolumeState(newVolume);
    setVolume(newVolume);
  };

  // Handle skip forward/backward
  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    seekTo(newTime);
  };

  // Auto-show player when video data is provided
  useEffect(() => {
    if (videoData && !showPlayer) {
      startPlayback();
    }
  }, [videoData]);

  if (!showPlayer || !metadata) {
    return null;
  }

  return (
    <Card className={cn(
      "fixed bottom-4 left-4 right-4 bg-background/95 backdrop-blur-md border shadow-lg z-50",
      isMobile ? "mx-2" : "mx-4",
      className
    )}>
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Album Art */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={metadata.artwork} alt={metadata.title} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {metadata.artist.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-1 text-foreground">
              {metadata.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {metadata.artist}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleSkip(-10)}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleSkip(10)}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Volume Control (Desktop only) */}
          {!isMobile && (
            <div className="flex items-center gap-2 w-24">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.01}
                className="flex-1"
              />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 space-y-2">
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
      </div>
    </Card>
  );
};

export default BackgroundAudioPlayer;