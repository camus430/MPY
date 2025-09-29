import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadIcon, RotateCcw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useDownloads } from "@/hooks/useDownloads";
import { useBackgroundPlayback } from "@/hooks/useBackgroundPlayback";
import NativeMediaPlayer from "@/components/NativeMediaPlayer";
import type { VideoWithCreator } from "@/types/database";
import { useState } from "react";

const Watch = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { addDownload, removeDownload, isDownloaded, isAddingDownload, isRemovingDownload } = useDownloads();
  const { configureVideoForBackground } = useBackgroundPlayback();
  const [isLooping, setIsLooping] = useState(false);

  const { data: currentVideo, isLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: async (): Promise<VideoWithCreator | null> => {
      if (!videoId) return null;
      
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          creator:creators(*)
        `)
        .eq("id", videoId)
        .single();

      if (error) {
        console.error("Erreur lors du chargement de la vidéo:", error);
        throw error;
      }

      return data as VideoWithCreator;
    },
    enabled: !!videoId,
  });

  const { data: creatorVideos } = useQuery({
    queryKey: ["creator-videos", currentVideo?.creator_id],
    queryFn: async (): Promise<VideoWithCreator[]> => {
      if (!currentVideo?.creator_id) return [];
      
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          creator:creators(*)
        `)
        .eq("creator_id", currentVideo.creator_id)
        .neq("id", videoId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des vidéos du créateur:", error);
        throw error;
      }

      return data as VideoWithCreator[];
    },
    enabled: !!currentVideo?.creator_id,
  });

  // Extraire l'ID YouTube de l'URL de la miniature (legacy)
  const getYouTubeVideoId = (thumbnailUrl: string) => {
    const match = thumbnailUrl.match(/\/vi\/([^\/]+)\//);
    return match ? match[1] : null;
  };

  const youtubeVideoId = currentVideo?.file_type === 'youtube' ? getYouTubeVideoId(currentVideo.thumbnail_url) : null;
  
  // Déterminer le type de lecteur à utiliser
  const getMediaUrl = () => {
    if (!currentVideo) return null;
    
    if (currentVideo.file_type === 'video' && currentVideo.video_file_url) {
      return currentVideo.video_file_url;
    } else if (currentVideo.file_type === 'audio' && currentVideo.audio_file_url) {
      return currentVideo.audio_file_url;
    }
    return null;
  };

  const mediaUrl = getMediaUrl();

  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M vues`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K vues`;
    }
    return `${count} vues`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la vidéo...</p>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Vidéo non trouvée</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button onClick={() => navigate("/")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1" : "grid-cols-3"
        )}>
          {/* Lecteur média principal */}
          <div className={cn(isMobile ? "col-span-1" : "col-span-2")}>
            <div className="space-y-4">
              {/* Lecteur natif pour fichiers locaux ou YouTube pour legacy */}
              {mediaUrl ? (
                <NativeMediaPlayer
                  src={mediaUrl}
                  title={currentVideo.title}
                  artist={currentVideo.creator.name}
                  thumbnail={currentVideo.thumbnail_url}
                  type={currentVideo.file_type === 'video' ? 'video' : 'audio'}
                  autoplay={true}
                  loop={isLooping}
                  onLoopChange={setIsLooping}
                />
              ) : youtubeVideoId ? (
                <div className="aspect-video w-full">
                  <iframe
                    ref={(iframe) => {
                      if (iframe) {
                        configureVideoForBackground(iframe);
                      }
                    }}
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1${isLooping ? `&loop=1&playlist=${youtubeVideoId}` : ''}`}
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Impossible de charger le média</p>
                </div>
              )}

              {/* Informations de la vidéo */}
              <div className="space-y-3">
                <h1 className="text-xl font-semibold text-foreground">
                  {currentVideo.title}
                </h1>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentVideo.creator.avatar_url} alt={currentVideo.creator.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {currentVideo.creator.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium text-foreground">{currentVideo.creator.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatViews(currentVideo.view_count)}
                        {currentVideo.file_size && (
                          <span> • {(currentVideo.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setIsLooping(!isLooping)}
                      variant={isLooping ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      title={isLooping ? "Désactiver la boucle" : "Activer la boucle"}
                    >
                      <RotateCcw className="h-4 w-4" />
                      {isLooping ? "Boucle ON" : "Boucle"}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (isDownloaded(currentVideo.id)) {
                          removeDownload(currentVideo.id);
                        } else {
                          addDownload(currentVideo.id);
                        }
                      }}
                      variant={isDownloaded(currentVideo.id) ? "default" : "outline"}
                      size="sm"
                      disabled={isAddingDownload || isRemovingDownload}
                      className="gap-2"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      {isDownloaded(currentVideo.id) ? "Sauvegardé" : "Sauvegarder"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne des vidéos du créateur */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Plus de {currentVideo.creator.name}
            </h2>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3">
                {creatorVideos?.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => navigate(`/watch/${video.id}`)}
                    className="flex gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="relative w-32 aspect-video flex-shrink-0">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {video.duration}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 text-foreground mb-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatViews(video.view_count)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;