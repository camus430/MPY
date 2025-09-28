import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import VideoCard from "@/components/VideoCard";
import { cn } from "@/lib/utils";
import { useVideos } from "@/hooks/useVideos";
import { formatViewCount, formatTimeAgo } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

// Importing generated images to use as fallback thumbnails
import thumbnailCoding from "@/assets/thumbnail-coding.jpg";
import thumbnailTravel from "@/assets/thumbnail-travel.jpg";
import thumbnailCooking from "@/assets/thumbnail-cooking.jpg";
import thumbnailGaming from "@/assets/thumbnail-gaming.jpg";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: videos = [], isLoading, error } = useVideos();

  // Fallback thumbnails mapping
  const fallbackThumbnails = [
    thumbnailCoding,
    thumbnailTravel, 
    thumbnailCooking,
    thumbnailGaming
  ];

  const getVideoThumbnail = (thumbnailUrl: string, index: number) => {
    // Si l'URL commence par '/placeholder', utiliser nos images générées
    if (thumbnailUrl.startsWith('/placeholder')) {
      return fallbackThumbnails[index % fallbackThumbnails.length];
    }
    return thumbnailUrl;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} />
          <main className={cn(
            "flex-1 pt-20 p-6 transition-all duration-300",
            sidebarOpen ? "ml-60" : "ml-20"
          )}>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
                <p className="text-muted-foreground">Impossible de charger les vidéos</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        
        <main
          className={cn(
            "flex-1 pt-20 p-6 transition-all duration-300",
            sidebarOpen ? "ml-60" : "ml-20"
          )}
        >
          <div className="max-w-[2000px] mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="aspect-video w-full rounded-lg" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {videos.map((video, index) => (
                  <VideoCard
                    key={video.id}
                    thumbnail={getVideoThumbnail(video.thumbnail_url, index)}
                    title={video.title}
                    channel={video.creator?.name || "Créateur inconnu"}
                    views={formatViewCount(video.view_count)}
                    timestamp={formatTimeAgo(video.created_at)}
                    duration={video.duration}
                    channelAvatar={video.creator?.avatar_url}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
