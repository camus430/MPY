import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Video } from "lucide-react";
import CreateCreatorDialog from "@/components/CreateCreatorDialog";
import { useCreators } from "@/hooks/useVideos";
import { formatViewCount } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

const Creators = () => {
  const { data: creators = [], isLoading, error } = useCreators();

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground">Impossible de charger les créateurs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Créateurs</h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos créateurs YouTube préférés
            </p>
          </div>
          <CreateCreatorDialog />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
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
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={creator.avatar_url || ''} alt={creator.name} />
                      <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                        {creator.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{creator.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {creator.youtube_channel_id ? `ID: ${creator.youtube_channel_id}` : 'Aucun ID'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {creator.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
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
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        Créateur
                      </Badge>
                    </div>
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

export default Creators;