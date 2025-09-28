import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Download, DownloadIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useDownloads } from "@/hooks/useDownloads";

interface VideoCardProps {
  id: string;
  thumbnail: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  duration: string;
  channelAvatar?: string;
  onDelete?: (id: string) => void;
  showDownloadButton?: boolean;
}

const VideoCard = ({
  id,
  thumbnail,
  title,
  channel,
  views,
  timestamp,
  duration,
  channelAvatar,
  onDelete,
  showDownloadButton = true,
}: VideoCardProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { addDownload, removeDownload, isDownloaded, isAddingDownload, isRemovingDownload } = useDownloads();

  const downloaded = isDownloaded(id);
  
  return (
    <Card 
      className="group cursor-pointer border-0 bg-transparent shadow-none hover:shadow-none"
      onClick={() => navigate(`/watch/${id}`)}
    >
      <div className={cn("space-y-2", isMobile ? "space-y-2" : "space-y-3")}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-medium">
              {duration}
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {showDownloadButton && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (downloaded) {
                    removeDownload(id);
                  } else {
                    addDownload(id);
                  }
                }}
                size="icon"
                variant={downloaded ? "default" : "secondary"}
                className="h-8 w-8"
                disabled={isAddingDownload || isRemovingDownload}
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                size="icon"
                variant="destructive"
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Video info */}
        <div className={cn("flex", isMobile ? "gap-2" : "gap-3")}>
          <Avatar className={cn(
            "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
            isMobile ? "h-7 w-7" : "h-9 w-9"
          )}>
            <AvatarImage src={channelAvatar} alt={channel} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground font-medium">
              {channel.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors",
              isMobile ? "text-sm leading-5" : "text-base"
            )}>
              {title}
            </h3>
            <div className="mt-1 space-y-1">
              <p className={cn(
                "text-muted-foreground hover:text-foreground cursor-pointer font-medium transition-colors",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {channel}
              </p>
              <div className={cn(
                "flex items-center gap-1 text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                <span>{views}</span>
                <span>•</span>
                <span>{timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VideoCard;