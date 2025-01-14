import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import VideoList from "./VideoList";
import StatsDisplay from "./StatsDisplay";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await supabase.functions.invoke('manual-fetch-videos');
      if (response.error) throw response.error;
      
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
          className="text-5xl sm:text-7xl font-bold mb-8 max-w-4xl bg-clip-text text-red-500"
        >
          Your Gateway to Inspirational Content
        </motion.h1>

        <div className="flex gap-4 justify-center mb-12">
          <Button asChild variant="default" size="lg" className="w-28 bg-[#ea384c] hover:bg-[#ea384c]/90">
            <Link to="/feed" className="w-full">Your Feed</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-28">
            <Link to="/creators" className="w-full">Creators</Link>
          </Button>
        </div>

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

        <StatsDisplay
          videoCount={yesterdayVideos?.length || 0}
          lastUpdateTime={lastUpdateTime}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
        />

        {yesterdayVideos && yesterdayVideos.length > 0 && (
          <VideoList videos={yesterdayVideos} />
        )}
      </motion.div>
    </div>
  );
};

export default Hero;