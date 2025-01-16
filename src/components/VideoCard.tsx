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
  subscribersCount?: number;
}

const VideoCard = ({ 
  title, 
  views, 
  thumbnail, 
  channelName, 
  publishedAt, 
  videoUrl, 
  channelUrl,
  subscribersCount = 0
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

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M subscribers`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K subscribers`;
    }
    return `${count} subscribers`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
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
            <p className="text-sm text-muted-foreground hover:text-foreground transition-colors">{channelName}</p>
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
          {subscribersCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatSubscribers(subscribersCount)}
            </p>
          )}
          <div className="flex flex-col gap-0.5 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <span>{views.toLocaleString()} views</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</span>
            </div>
            <span className="text-xs">
              {formatInTimeZone(new Date(publishedAt), 'Europe/Paris', 'PPP')}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VideoCard;