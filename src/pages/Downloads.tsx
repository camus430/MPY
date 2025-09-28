import { useDownloads } from "@/hooks/useDownloads";
import VideoCard from "@/components/VideoCard";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Downloads = () => {
  const { downloads, isLoading, removeDownload } = useDownloads();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M vues`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K vues`;
    }
    return `${count} vues`;
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: fr 
      });
    } catch {
      return "Date inconnue";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des téléchargements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mes Téléchargements
          </h1>
          <p className="text-muted-foreground">
            {downloads.length} vidéo{downloads.length !== 1 ? 's' : ''} sauvegardée{downloads.length !== 1 ? 's' : ''}
          </p>
        </div>

        {downloads.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucun téléchargement
              </h3>
              <p className="text-muted-foreground mb-6">
                Commencez à sauvegarder vos vidéos préférées pour les retrouver facilement ici.
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Parcourir les vidéos
              </button>
            </div>
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          )}>
            {downloads.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                thumbnail={video.thumbnail_url}
                title={video.title}
                channel={video.creator.name}
                views={formatViews(video.view_count)}
                timestamp={formatDate(video.created_at)}
                duration={video.duration}
                channelAvatar={video.creator.avatar_url}
                onDelete={(id) => removeDownload(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Downloads;