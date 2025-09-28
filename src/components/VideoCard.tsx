import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoCardProps {
  thumbnail: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  duration: string;
  channelAvatar?: string;
}

const VideoCard = ({
  thumbnail,
  title,
  channel,
  views,
  timestamp,
  duration,
  channelAvatar,
}: VideoCardProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="group cursor-pointer border-0 bg-transparent shadow-none hover:shadow-none">
      <div className="space-y-3">
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
        </div>

        {/* Video info */}
        <div className="flex gap-3">
          <Avatar className={cn(
            "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
            isMobile ? "h-8 w-8" : "h-9 w-9"
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