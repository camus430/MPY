import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { useCreators } from "@/hooks/useVideos";
import { formatSubscriberCount } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import CreateCreatorDialog from "@/components/CreateCreatorDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const Creators = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { data: creators = [], isLoading, error } = useCreators();

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className={cn(
            "flex-1 pt-16 p-3 sm:p-6 transition-all duration-300",
            !isMobile && sidebarOpen ? "lg:ml-60" : !isMobile ? "lg:ml-20" : "ml-0"
          )}>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
                <p className="text-muted-foreground">Impossible de charger les créateurs</p>
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
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main
          className={cn(
            "flex-1 pt-16 p-3 sm:p-6 transition-all duration-300",
            !isMobile && sidebarOpen ? "lg:ml-60" : !isMobile ? "lg:ml-20" : "ml-0"
          )}
        >
          <div className="max-w-6xl mx-auto">
            {/* Section d'en-tête avec bouton bien visible */}
            <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Créateurs</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Gérez la liste des créateurs de votre plateforme YouTube
                  </p>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <CreateCreatorDialog />
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="p-4 sm:p-6">
                    <CardContent className="p-0">
                      <div className="flex flex-col items-center space-y-4">
                        <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : creators.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <p className="text-lg mb-2">Aucun créateur trouvé</p>
                  <p>Commencez par ajouter votre premier créateur !</p>
                </div>
                <CreateCreatorDialog />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {creators.map((creator) => (
                  <Card key={creator.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                          <AvatarImage 
                            src={creator.avatar_url || undefined} 
                            alt={creator.name}
                          />
                          <AvatarFallback className="text-base sm:text-lg font-semibold bg-primary text-primary-foreground">
                            {creator.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="text-center space-y-2">
                          <h3 className="font-semibold text-base sm:text-lg text-foreground">
                            {creator.name}
                          </h3>
                          <p className="text-sm sm:text-base text-muted-foreground font-medium">
                            {formatSubscriberCount(creator.subscriber_count)}
                          </p>
                          {creator.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                              {creator.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Creators;