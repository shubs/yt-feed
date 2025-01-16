import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "./Button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import VideoCard from "./VideoCard";

const Hero = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: todayVideos, isLoading } = useQuery({
    queryKey: ['todayVideos'],
    queryFn: async () => {
      console.log('Fetching today videos');
      const today = new Date();
      const start = startOfDay(today);
      const end = endOfDay(today);
      
      const { data: videos, error } = await supabase
        .from('youtube_videos')
        .select('*, creators!inner(subscribers_count)')
        .gte('published_at', start.toISOString())
        .lte('published_at', end.toISOString())
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching today videos:', error);
        throw error;
      }
      
      console.log('Today videos:', videos);
      return videos || [];
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
    const startTime = performance.now();

    try {
      const response = await supabase.functions.invoke('manual-fetch-videos');
      if (response.error) throw response.error;
      
      const endTime = performance.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2);
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['todayVideos'] }),
        queryClient.invalidateQueries({ queryKey: ['lastUpdateTime'] })
      ]);

      toast({
        title: "Success",
        description: `Videos refreshed in ${processingTime} seconds. ${response.data?.totalVideosProcessed || 0} videos processed.`,
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
          className="text-5xl sm:text-7xl font-bold mb-8 max-w-4xl bg-clip-text text-red-500"
        >
          Your Gateway to Inspirational Content
        </motion.h1>

        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <>
            There are{" "}
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="font-bold text-primary"
            >
              {todayVideos?.length || 0}
            </motion.span>{" "}
            videos posted today
          </>
        )}

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
              className="ml-2 !p-2 h-8 w-8"
              variant="secondary"
              title="Refresh videos"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
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
          <div className="flex gap-4 justify-center">
            <Link to="/feed">
              <Button className="hover:scale-105 transition-transform duration-200">
                Your Feed
              </Button>
            </Link>
            <Link to="/creators">
              <Button className="hover:scale-105 transition-transform duration-200">
                Creators
              </Button>
            </Link>
          </div>

          {todayVideos && todayVideos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 w-full max-w-3xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-8 text-left text-gray-800">Today's Videos</h2>
              <div className="space-y-4">
                {todayVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    title={video.video_title}
                    views={video.views || 0}
                    thumbnail={video.thumbnail_url}
                    channelName={video.channel_name}
                    publishedAt={video.published_at}
                    videoUrl={video.video_url}
                    channelUrl={video.creators?.channel_url}
                    subscriberCount={video.creators?.subscribers_count || 0}
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
