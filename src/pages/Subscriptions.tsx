import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Video, Eye } from "lucide-react";
import { useCreators } from "@/hooks/useVideos";
import { formatViewCount } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const Subscriptions = () => {
  const { data: creators = [], isLoading, error } = useCreators();
  const navigate = useNavigate();

  const handleCreatorClick = (creatorId: string, creatorName: string) => {
    // Naviguer vers l'accueil avec le filtre du créateur
    navigate(`/?creator=${creatorId}&name=${encodeURIComponent(creatorName)}`);
  };

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground">Impossible de charger vos abonnements</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mes Abonnements</h1>
          <p className="text-muted-foreground">
            {creators.length} créateur{creators.length !== 1 ? 's' : ''} suivi{creators.length !== 1 ? 's' : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : creators.length === 0 ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Aucun abonnement</h2>
              <p className="text-muted-foreground mb-4">
                Vous ne suivez aucun créateur pour le moment
              </p>
              <Button onClick={() => navigate('/creators')} variant="outline">
                Découvrir des créateurs
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <Card 
                key={creator.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => handleCreatorClick(creator.id, creator.name)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 group-hover:scale-105 transition-transform">
                      <AvatarImage src={creator.avatar_url || ''} alt={creator.name} />
                      <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                        {creator.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                        {creator.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Créateur YouTube
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {creator.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {creator.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {creator.subscriber_count !== null && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {formatViewCount(creator.subscriber_count)} abonnés
                        </Badge>
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreatorClick(creator.id, creator.name);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir les vidéos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;