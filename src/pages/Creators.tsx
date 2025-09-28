import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { useCreators } from "@/hooks/useVideos";
import { formatSubscriberCount } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const Creators = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: creators = [], isLoading, error } = useCreators();

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
        <Sidebar isOpen={sidebarOpen} />
        
        <main
          className={cn(
            "flex-1 pt-20 p-6 transition-all duration-300",
            sidebarOpen ? "ml-60" : "ml-20"
          )}
        >
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-foreground">Créateurs</h1>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="p-6">
                    <CardContent className="p-0">
                      <div className="flex flex-col items-center space-y-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {creators.map((creator) => (
                  <Card key={creator.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage 
                            src={creator.avatar_url || undefined} 
                            alt={creator.name}
                          />
                          <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                            {creator.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="text-center space-y-2">
                          <h3 className="font-semibold text-lg text-foreground">
                            {creator.name}
                          </h3>
                          <p className="text-muted-foreground font-medium">
                            {formatSubscriberCount(creator.subscriber_count)}
                          </p>
                          {creator.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
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