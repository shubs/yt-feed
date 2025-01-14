import { Play, ExternalLink } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

interface VideoCardProps {
  title: string;
  views: number;
  thumbnail: string;
  channelName: string;
  publishedAt: string;
  videoUrl: string;
}

const VideoCard = ({ title, views, thumbnail, channelName, publishedAt, videoUrl }: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Extract video ID from YouTube URL
  const videoId = videoUrl.split('v=')[1]?.split('&')[0];

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  const handleWatchClick = () => {
    window.open(videoUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-2 border-black/5 group hover:border-primary/20 transition-colors duration-200 bg-white/80 backdrop-blur-sm">
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
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <CardContent className="p-4">
          <div className="flex items-center justify-end mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
              onClick={handleWatchClick}
            >
              Watch on YouTube
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:line-clamp-none transition-all duration-200">{title}</h3>
          <p className="text-sm text-gray-600 mb-1 hover:text-primary transition-colors">{channelName}</p>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{views.toLocaleString()} views</span>
            <span>{format(new Date(publishedAt), 'MMM d, yyyy')}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VideoCard;