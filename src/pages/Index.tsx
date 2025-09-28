import VideoCard from "@/components/VideoCard";
import { useVideos } from "@/hooks/useVideos";
import { useDeleteVideo } from "@/hooks/useDeleteVideo";
import { formatViewCount, formatTimeAgo } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

// Importing generated images to use as fallback thumbnails
import thumbnailCoding from "@/assets/thumbnail-coding.jpg";
import thumbnailTravel from "@/assets/thumbnail-travel.jpg";
import thumbnailCooking from "@/assets/thumbnail-cooking.jpg";
import thumbnailGaming from "@/assets/thumbnail-gaming.jpg";

const Index = () => {
  const { data: videos = [], isLoading, error } = useVideos();
  const deleteVideoMutation = useDeleteVideo();

  // Fallback thumbnails mapping
  const fallbackThumbnails = [
    thumbnailCoding,
    thumbnailTravel,
    thumbnailCooking,
    thumbnailGaming
  ];

  const getVideoThumbnail = (thumbnailUrl: string, index: number) => {
    if (thumbnailUrl.startsWith('/placeholder')) {
      return fallbackThumbnails[index % fallbackThumbnails.length];
    }
    return thumbnailUrl;
  };

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground">Impossible de charger les vidéos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="w-full max-w-[1400px] mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-items-center">
            {videos.map((video, index) => (
              <div key={video.id} className="w-full max-w-sm">
                <VideoCard
                  id={video.id}
                  thumbnail={getVideoThumbnail(video.thumbnail_url, index)}
                  title={video.title}
                  channel={video.creator?.name || "Créateur inconnu"}
                  views={formatViewCount(video.view_count)}
                  timestamp={formatTimeAgo(video.created_at)}
                  duration={video.duration}
                  channelAvatar={video.creator?.avatar_url}
                  onDelete={(videoId) => deleteVideoMutation.mutate(videoId)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;