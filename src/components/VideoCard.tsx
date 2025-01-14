import { Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface VideoCardProps {
  title: string;
  views: string;
  thumbnail: string;
}

const VideoCard = ({ title, views, thumbnail }: VideoCardProps) => {
  return (
    <Card className="overflow-hidden border-2 border-black">
      <div className="relative aspect-video bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-16 h-16 text-white opacity-80" />
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
        <p className="text-sm text-gray-600">{views}</p>
      </CardContent>
    </Card>
  );
};

export default VideoCard;