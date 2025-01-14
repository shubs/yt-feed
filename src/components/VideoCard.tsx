import { Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { format } from "date-fns";

interface VideoCardProps {
  title: string;
  views: number;
  thumbnail: string;
  channelName: string;
  publishedAt: string;
}

const VideoCard = ({ title, views, thumbnail, channelName, publishedAt }: VideoCardProps) => {
  return (
    <Card className="overflow-hidden border-2 border-black">
      <div className="relative aspect-video bg-black">
        <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
          <Play className="w-16 h-16 text-white" />
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Play className="w-6 h-6" />
            <SkipBack className="w-6 h-6" />
            <SkipForward className="w-6 h-6" />
          </div>
          <Volume2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-1">{channelName}</p>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{views.toLocaleString()} views</span>
          <span>{format(new Date(publishedAt), 'MMM d, yyyy')}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;