import { motion } from "framer-motion";
import { formatInTimeZone } from "date-fns-tz";
import { Loader2, RefreshCw } from "lucide-react";
import Button from "../Button";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface VideoStatsProps {
  videoCount: number;
  isLoading: boolean;
  lastUpdateTime?: string;
}

const VideoStats = ({ videoCount, isLoading, lastUpdateTime }: VideoStatsProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    <>
      {isLoading ? (
        <span className="text-center block">Loading...</span>
      ) : (
        <div className="text-center">
          There are{" "}
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="font-bold text-primary"
          >
            {videoCount}
          </motion.span>{" "}
          videos posted today
        </div>
      )}

      {lastUpdateTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-gray-500 flex items-center justify-center gap-2 mt-2"
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
    </>
  );
};

export default VideoStats;