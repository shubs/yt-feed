import { Play, ExternalLink } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { formatInTimeZone } from "date-fns-tz";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "./ui/button";

interface VideoCardProps {
  title: string;
  views: number;
  thumbnail: string;
  channelName: string;
  publishedAt: string;
  videoUrl: string;
  channelUrl?: string;
  subscriberCount?: number;
  variant?: 'default' | 'compact';
}

const formatSubscriberCount = (count: number): string => {
  switch (true) {
    case count >= 1000000:
      return `${(count / 1000000).toFixed(1)}M subscribers`;
    case count >= 1000:
      return `${(count / 1000).toFixed(1)}K subscribers`;
    default:
      return `${count} subscribers`;
  }
};

const VideoCard = ({ 
  title, 
  views, 
  thumbnail, 
  channelName, 
  publishedAt, 
  videoUrl, 
  channelUrl,
  subscriberCount,
  variant = 'default'
}: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoId = videoUrl.split('v=')[1]?.split('&')[0];

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (channelUrl) {
      window.open(channelUrl, '_blank');
    }
  };

  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden border-none shadow-none hover:bg-secondary/50 transition-colors duration-200 rounded-none">
        <div className="flex gap-4">
          <div className="relative w-48 aspect-video bg-black flex-shrink-0 cursor-pointer">
            {isPlaying ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              />
            ) : (
              <>
                <img 
                  src={thumbnail} 
                  alt={title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-200" 
                />
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={handlePlayClick}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Play className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
              </>
            )}
          </div>
          <div className="flex-1 min-w-0 py-2">
            <h3 className="text-base font-medium line-clamp-2 mb-1 text-left">{title}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate">
                {channelName}
                {subscriberCount !== undefined && (
                  <span className="text-xs text-muted-foreground ml-1">
                    • {formatSubscriberCount(subscriberCount)}
                  </span>
                )}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 -ml-1"
                onClick={handleChannelClick}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="sr-only">Visit channel</span>
              </Button>
            </div>
            <div className="flex flex-col gap-0.5 text-sm mt-1">
              <div className="flex items-center gap-1 text-black font-bold">
                <span>{views.toLocaleString()} views</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</span>
              </div>
              <span className="text-xs text-black font-bold">
                {formatInTimeZone(new Date(publishedAt), 'Europe/Paris', 'PPP')}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-none shadow-none hover:bg-secondary/50 transition-colors duration-200 rounded-none">
      <div className="relative aspect-video bg-black cursor-pointer">
        {isPlaying ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0"
          />
        ) : (
          <>
            <img 
              src={thumbnail} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" 
            />
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
              onClick={handlePlayClick}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play className="w-16 h-16 text-white" />
              </motion.div>
            </div>
          </>
        )}
      </div>
      <CardContent className="p-3 text-left">
        <h3 className="text-base font-medium line-clamp-2 mb-1">{title}</h3>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {channelName}
            {subscriberCount !== undefined && (
              <span className="text-xs text-muted-foreground ml-1">
                • {formatSubscriberCount(subscriberCount)}
              </span>
            )}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 -ml-1"
            onClick={handleChannelClick}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="sr-only">Visit channel</span>
          </Button>
        </div>
        <div className="flex flex-col gap-0.5 text-sm mt-1">
          <div className="flex items-center gap-1 text-black font-bold">
            <span>{views.toLocaleString()} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</span>
          </div>
          <span className="text-xs text-black font-bold">
            {formatInTimeZone(new Date(publishedAt), 'Europe/Paris', 'PPP')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;