import { Play, Volume2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { format } from "date-fns";
import { Button } from "./ui/button";

interface VideoCardProps {
  title: string;
  views: number;
  thumbnail: string;
  channelName: string;
  publishedAt: string;
  videoUrl: string;
}

const VideoCard = ({ title, views, thumbnail, channelName, publishedAt, videoUrl }: VideoCardProps) => {
  const handleWatchClick = () => {
    window.open(videoUrl, '_blank');
  };

  return (
    <Card className="overflow-hidden border-2 border-black group">
      <div className="relative aspect-video bg-black cursor-pointer" onClick={handleWatchClick}>
        <img 
          src={thumbnail} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-16 h-16 text-white" />
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Volume2 className="w-6 h-6" />
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleWatchClick}
          >
            Watch on YouTube
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:line-clamp-none">{title}</h3>
        <p className="text-sm text-gray-600 mb-1 hover:text-black transition-colors">{channelName}</p>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{views.toLocaleString()} views</span>
          <span>{format(new Date(publishedAt), 'MMM d, yyyy')}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;