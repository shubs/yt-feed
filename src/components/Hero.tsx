import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "./Button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Hero = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const { data: lastUpdateTime } = useQuery({
    queryKey: ['lastUpdateTime'],
    queryFn: async () => {
      console.log('Fetching last update time');
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching last update time:', error);
        throw error;
      }

      return data?.[0]?.updated_at;
    },
    refetchInterval: 1000 * 60 * 5 // Refetch every 5 minutes
  });

  const handleVideoClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await supabase.functions.invoke('manual-fetch-videos');
      if (response.error) throw response.error;
      
      // Refetch the queries to update the UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['yesterdayVideos'] }),
        queryClient.invalidateQueries({ queryKey: ['lastUpdateTime'] })
      ]);

      toast({
        title: "Success",
        description: "Videos have been refreshed successfully",
      });
    } catch (error) {
      console.error('Error refreshing videos:', error);
      toast({
        title: "Error",
        description: "Failed to refresh videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

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

        {lastUpdateTime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-sm text-gray-500 flex items-center gap-2 justify-center"
          >
            <span>Last updated: {formatInTimeZone(new Date(lastUpdateTime), 'Europe/Paris', 'PPP p')}</span>
            <Button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="ml-2 !p-2 h-8"
              variant="secondary"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh Now"
              )}
            </Button>
          </motion.div>
        )}

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
              className="mt-12 w-full max-w-3xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-8 text-left text-gray-800">Yesterday's Videos</h2>
              <div className="space-y-4">
                {yesterdayVideos.slice(0, 3).map((video) => (
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
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;