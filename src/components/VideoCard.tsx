import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  return (
    <Card className="group cursor-pointer border-0 bg-transparent shadow-none hover:shadow-none">
      <div className="space-y-3">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {duration}
          </div>
        </div>

        {/* Video info */}
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={channelAvatar} alt={channel} />
            <AvatarFallback>{channel.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="mt-1 space-y-1">
              <p className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                {channel}
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
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