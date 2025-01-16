import { motion } from "framer-motion";
import VideoCard from "../VideoCard";
import { Video } from "@/types";

interface TodayVideosProps {
  videos: Video[];
}

const TodayVideos = ({ videos }: TodayVideosProps) => {
  if (!videos || videos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="mt-12 w-full"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Today's Videos</h2>
      <div className="space-y-2 divide-y divide-gray-100">
        {videos.map((video) => (
          <div key={video.id} className="pt-2 first:pt-0">
            <VideoCard
              title={video.video_title}
              views={video.views || 0}
              thumbnail={video.thumbnail_url}
              channelName={video.channel_name}
              publishedAt={video.published_at}
              videoUrl={video.video_url}
              channelUrl={video.creators?.channel_url}
              subscriberCount={video.creators?.subscribers_count || 0}
              variant="compact"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TodayVideos;