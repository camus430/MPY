import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import VideoCard from "@/components/VideoCard";
import { cn } from "@/lib/utils";

// Importing generated images
import thumbnailCoding from "@/assets/thumbnail-coding.jpg";
import thumbnailTravel from "@/assets/thumbnail-travel.jpg";
import thumbnailCooking from "@/assets/thumbnail-cooking.jpg";
import thumbnailGaming from "@/assets/thumbnail-gaming.jpg";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock video data
  const videos = [
    {
      id: 1,
      thumbnail: thumbnailCoding,
      title: "Apprendre React en 2024 : Guide Complet pour Débutants",
      channel: "CodeAcademy FR",
      views: "125K vues",
      timestamp: "il y a 2 jours",
      duration: "15:42",
      channelAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 2,
      thumbnail: thumbnailTravel,
      title: "VOYAGE ÉPIQUE en Islande | Les plus beaux paysages du monde",
      channel: "Adventure Seekers",
      views: "89K vues",
      timestamp: "il y a 1 semaine",
      duration: "22:18",
      channelAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b547?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 3,
      thumbnail: thumbnailCooking,
      title: "La MEILLEURE Recette de Croissants Maison (Secret de Boulanger)",
      channel: "Chef Antoine",
      views: "256K vues",
      timestamp: "il y a 3 jours",
      duration: "18:35",
      channelAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 4,
      thumbnail: thumbnailGaming,
      title: "MON SETUP GAMING 2024 | 5000€ de matériel !",
      channel: "Gaming Pro",
      views: "67K vues",
      timestamp: "il y a 5 jours",
      duration: "12:20",
      channelAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 5,
      thumbnail: thumbnailCoding,
      title: "JavaScript ES6+ : Les fonctionnalités que tout dev doit connaître",
      channel: "Dev Masters",
      views: "198K vues",
      timestamp: "il y a 1 semaine",
      duration: "25:14",
      channelAvatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 6,
      thumbnail: thumbnailTravel,
      title: "Road Trip en Norvège : 7 jours d'aventure pure !",
      channel: "Travel Stories",
      views: "143K vues",
      timestamp: "il y a 2 semaines",
      duration: "28:47",
      channelAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 7,
      thumbnail: thumbnailCooking,
      title: "PASTA CARBONARA Authentique | La VRAIE recette italienne",
      channel: "Cucina Italiana",
      views: "312K vues",
      timestamp: "il y a 4 jours",
      duration: "14:28",
      channelAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 8,
      thumbnail: thumbnailGaming,
      title: "TOP 10 des JEUX à Absolument Jouer en 2024",
      channel: "Game Reviews",
      views: "445K vues",
      timestamp: "il y a 1 semaine",
      duration: "16:52",
      channelAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
    }
  ];

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  thumbnail={video.thumbnail}
                  title={video.title}
                  channel={video.channel}
                  views={video.views}
                  timestamp={video.timestamp}
                  duration={video.duration}
                  channelAvatar={video.channelAvatar}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
