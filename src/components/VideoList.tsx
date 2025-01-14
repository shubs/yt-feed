import { motion } from "framer-motion";
import { formatInTimeZone } from "date-fns-tz";

interface Video {
  id: string;
  video_title: string;
  thumbnail_url: string;
  video_url: string;
  channel_name: string;
  views: number;
  published_at: string;
}

interface VideoListProps {
  videos: Video[];
}

const VideoList = ({ videos }: VideoListProps) => {
  const handleVideoClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="mt-12 w-full max-w-3xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-8 text-left text-gray-800">Yesterday's Videos</h2>
      <div className="space-y-4">
        {videos.slice(0, 3).map((video) => (
          <div 
            key={video.id}
            className="flex gap-4 items-start bg-white/80 backdrop-blur-sm p-4 rounded-lg border-2 border-black/5 hover:border-primary/20 transition-colors duration-200"
          >
            <div 
              className="relative w-40 aspect-video flex-shrink-0 overflow-hidden rounded-md cursor-pointer"
              onClick={() => handleVideoClick(video.video_url)}
            >
              <img 
                src={video.thumbnail_url} 
                alt={video.video_title}
                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex-grow min-w-0 text-left">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:line-clamp-none transition-all duration-200">
                {video.video_title}
              </h3>
              <p className="text-sm text-gray-600 mb-1">{video.channel_name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{(video.views || 0).toLocaleString()} views</span>
                <span>•</span>
                <span>{formatInTimeZone(new Date(video.published_at), 'Europe/Paris', 'PPP')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default VideoList;