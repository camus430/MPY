import VideoCard from "@/components/VideoCard";
import { useVideos } from "@/hooks/useVideos";
import { useDeleteVideo } from "@/hooks/useDeleteVideo";
import { useSearch } from "@/hooks/useSearch";
import { formatViewCount, formatTimeAgo } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, X, Filter, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useMemo, useEffect } from "react";

// Importing generated images to use as fallback thumbnails
import thumbnailCoding from "@/assets/thumbnail-coding.jpg";
import thumbnailTravel from "@/assets/thumbnail-travel.jpg";
import thumbnailCooking from "@/assets/thumbnail-cooking.jpg";
import thumbnailGaming from "@/assets/thumbnail-gaming.jpg";

const Index = () => {
  const { data: videos = [], isLoading, error, refetch } = useVideos();
  const deleteVideoMutation = useDeleteVideo();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filter parameters from URL
  const creatorIdFilter = searchParams.get('creator');
  const creatorNameFilter = searchParams.get('name');
  const searchQuery = searchParams.get('search');

  // Filter videos by creator if specified
  const creatorFilteredVideos = useMemo(() => {
    if (!creatorIdFilter) return videos;
    return videos.filter(video => video.creator_id === creatorIdFilter);
  }, [videos, creatorIdFilter]);

  // Use search hook with creator-filtered videos
  const { searchTerm, setSearchTerm, filteredVideos, clearSearch, isSearching } = useSearch(creatorFilteredVideos);

  // Sync search term with URL params
  useEffect(() => {
    if (searchQuery && searchQuery !== searchTerm) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery, searchTerm, setSearchTerm]);

  // Update URL when search term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [searchTerm, searchParams, setSearchParams]);

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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["videos"] });
    queryClient.invalidateQueries({ queryKey: ["creators"] });
    refetch();
  };

  const clearFilter = () => {
    clearSearch();
    setSearchParams({});
  };

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground mb-4">Impossible de charger les vidéos</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-8">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {isSearching ? `Résultats pour "${searchTerm}"` : 
               creatorNameFilter ? `Vidéos de ${creatorNameFilter}` : 'Toutes les vidéos'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {filteredVideos.length} média{filteredVideos.length !== 1 ? 's' : ''} trouvé{filteredVideos.length !== 1 ? 's' : ''}
              {isSearching || creatorNameFilter ? '' : ' • Incluant vidéos et audio pour lecture en arrière-plan'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isSearching && (
              <Badge variant="secondary" className="flex items-center gap-2 text-xs">
                <Search className="h-3 w-3" />
                <span className="max-w-[120px] truncate">{searchTerm}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearSearch}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {creatorIdFilter && (
              <Badge variant="secondary" className="flex items-center gap-2 text-xs">
                <Filter className="h-3 w-3" />
                <span className="max-w-[120px] truncate">{creatorNameFilter}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilter}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            <Button onClick={handleRefresh} variant="outline" size="sm" className="text-xs">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-3 sm:space-y-4">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <div className="flex gap-2 sm:gap-3">
                  <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-2 sm:h-3 w-3/4" />
                    <Skeleton className="h-2 sm:h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex items-center justify-center min-h-[50vh] px-4">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                {isSearching
                  ? `Aucun résultat pour "${searchTerm}"`
                  : creatorNameFilter 
                    ? `Aucune vidéo de ${creatorNameFilter}` 
                    : 'Aucune vidéo trouvée'
                }
              </h2>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {isSearching
                  ? 'Essayez avec des mots-clés différents ou vérifiez l\'orthographe'
                  : creatorNameFilter 
                    ? 'Ce créateur n\'a pas encore de vidéos synchronisées'
                    : 'Ajoutez des créateurs pour voir leurs vidéos apparaître ici'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {(isSearching || creatorIdFilter) && (
                  <Button onClick={clearFilter} variant="outline" size="sm">
                    {isSearching ? 'Effacer la recherche' : 'Voir toutes les vidéos'}
                  </Button>
                )}
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 justify-items-center">
            {filteredVideos.map((video, index) => (
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
                  video={video}
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