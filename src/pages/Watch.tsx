import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadIcon, RotateCcw, SkipBack, SkipForward, PlayCircle } from "lucide-react";
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
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { addDownload, removeDownload, isDownloaded, isAddingDownload, isRemovingDownload } = useDownloads();
  const [isLooping, setIsLooping] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  // Vérifier si on vient d'un filtre de créateur
  const fromCreatorFilter = searchParams.get('from') === 'creator';

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

  // Charger toutes les vidéos du créateur OU toutes les vidéos selon la provenance
  const { data: allVideos } = useQuery({
    queryKey: ["related-videos", currentVideo?.creator_id, fromCreatorFilter],
    queryFn: async (): Promise<VideoWithCreator[]> => {
      if (!currentVideo) return [];
      
      const query = supabase
        .from("videos")
        .select(`
          *,
          creator:creators(*)
        `)
        .order("created_at", { ascending: false });

      // Si on vient d'un filtre créateur, ne montrer que les vidéos de ce créateur
      if (fromCreatorFilter) {
        query.eq("creator_id", currentVideo.creator_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erreur lors du chargement des vidéos:", error);
        throw error;
      }

      return data as VideoWithCreator[];
    },
    enabled: !!currentVideo,
  });

  // Trouver l'index de la vidéo actuelle et les vidéos précédente/suivante
  const currentIndex = allVideos?.findIndex(v => v.id === videoId) ?? -1;
  const previousVideo = currentIndex > 0 ? allVideos?.[currentIndex - 1] : null;
  const nextVideo = currentIndex >= 0 && currentIndex < (allVideos?.length ?? 0) - 1 ? allVideos?.[currentIndex + 1] : null;
  
  // Vidéos à afficher (excluant la vidéo actuelle)
  const otherVideos = allVideos?.filter(v => v.id !== videoId) ?? [];

  const handlePrevious = () => {
    if (previousVideo) {
      navigate(`/watch/${previousVideo.id}`);
    }
  };

  const handleNext = () => {
    if (nextVideo) {
      navigate(`/watch/${nextVideo.id}`);
    }
  };

  const handleVideoEnd = () => {
    if (!isLooping && autoplayEnabled && nextVideo) {
      handleNext();
    }
  };

  // Configuration de la lecture en arrière-plan avec contrôles de navigation
  const { configureVideoForBackground } = useBackgroundPlayback({
    onPrevious: previousVideo ? handlePrevious : undefined,
    onNext: nextVideo ? handleNext : undefined
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
                  onEnded={handleVideoEnd}
                  onPrevious={previousVideo ? handlePrevious : undefined}
                  onNext={nextVideo ? handleNext : undefined}
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
                      onClick={handlePrevious}
                      variant="outline"
                      size="sm"
                      disabled={!previousVideo}
                      className="gap-2"
                      title="Vidéo précédente"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={handleNext}
                      variant="outline"
                      size="sm"
                      disabled={!nextVideo}
                      className="gap-2"
                      title="Vidéo suivante"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                      variant={autoplayEnabled ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      title={autoplayEnabled ? "Désactiver la lecture auto" : "Activer la lecture auto"}
                    >
                      <PlayCircle className="h-4 w-4" />
                      {autoplayEnabled ? "Auto ON" : "Auto"}
                    </Button>
                    
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

          {/* Colonne des vidéos */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {fromCreatorFilter ? `Plus de ${currentVideo.creator.name}` : 'Toutes les vidéos'}
            </h2>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 gap-3">
                {otherVideos?.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => navigate(`/watch/${video.id}${fromCreatorFilter ? '?from=creator' : ''}`)}
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
                        {video.creator.name}
                      </p>
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