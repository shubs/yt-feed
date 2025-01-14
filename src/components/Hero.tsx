import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "./Button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays } from "date-fns";
import VideoCard from "./VideoCard";

const Hero = () => {
  const { data: yesterdayVideos, isLoading } = useQuery({
    queryKey: ['yesterdayVideos'],
    queryFn: async () => {
      console.log('Fetching yesterday videos');
      const yesterday = subDays(new Date(), 1);
      const start = startOfDay(yesterday);
      const end = endOfDay(yesterday);
      
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .gte('published_at', start.toISOString())
        .lte('published_at', end.toISOString())
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching yesterday videos:', error);
        throw error;
      }
      
      console.log('Yesterday videos:', data);
      return data || [];
    }
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 -z-10" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-8"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-7xl font-bold mb-8 max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
        >
          Welcome to your YT feed
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-2xl sm:text-3xl mb-12 max-w-2xl text-gray-600"
        >
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <>
              There were{" "}
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="font-bold text-primary"
              >
                {yesterdayVideos?.length || 0}
              </motion.span>{" "}
              videos posted yesterday
            </>
          )}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="space-y-8"
        >
          <Link to="/feed">
            <Button className="hover:scale-105 transition-transform duration-200">
              Feed
            </Button>
          </Link>

          {yesterdayVideos && yesterdayVideos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold mb-8 text-gray-800">Yesterday's Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {yesterdayVideos.slice(0, 3).map((video) => (
                  <VideoCard
                    key={video.id}
                    title={video.video_title}
                    views={video.views || 0}
                    thumbnail={video.thumbnail_url}
                    channelName={video.channel_name}
                    publishedAt={video.published_at}
                    videoUrl={video.video_url}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;