import React, { useState } from 'react';
import { useBackgroundAudio } from '@/hooks/useBackgroundAudio';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause } from 'lucide-react';
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
    isPlaying,
    currentTime,
    duration,
    metadata,
  } = useBackgroundAudio();

  const [showPlayer, setShowPlayer] = useState(false);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start playing audio (simplified for demo)
  const startPlayback = async () => {
    if (!videoData) return;

    try {
      // For demo purposes, we'll just show the player
      // In production, you'd extract audio from YouTube or use YouTube API
      setShowPlayer(true);
      
      // Simulate audio playback with metadata
      await playAudio('', {
        title: videoData.title,
        artist: videoData.creator,
        album: 'MPY',
        artwork: videoData.thumbnail,
      });
    } catch (error) {
      console.error('Failed to start playback:', error);
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

  // Auto-show player when video data is provided
  React.useEffect(() => {
    if (videoData && !showPlayer) {
      startPlayback();
    }
  }, [videoData]);

  if (!showPlayer || !videoData) {
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
            <AvatarImage src={videoData.thumbnail} alt={videoData.title} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {videoData.creator.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-1 text-foreground">
              {videoData.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {videoData.creator}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Progress indication */}
        {duration > 0 && (
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BackgroundAudioPlayer;