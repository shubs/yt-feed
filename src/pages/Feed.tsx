import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import VideoGrid from "@/components/VideoGrid";
import FilterBar from "@/components/FilterBar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const Feed = () => {
  const [dateFilter, setDateFilter] = useState("date");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const updateSubscribers = async () => {
      try {
        console.log('Automatically updating subscriber counts...');
        const { data, error } = await supabase.functions.invoke('update-subscribers');
        
        if (error) throw error;

        const successCount = data.results.filter(r => r.status === 'success').length;
        const errorCount = data.results.filter(r => r.status === 'error').length;

        await queryClient.invalidateQueries();

        console.log(`Updated ${successCount} creators successfully${errorCount > 0 ? `. ${errorCount} failed` : ''}.`);
      } catch (error) {
        console.error('Error updating subscriber counts:', error);
      }
    };

    updateSubscribers();
  }, []); // Run once when component mounts

  // New effect to automatically refresh videos when component mounts
  useEffect(() => {
    const refreshVideos = async () => {
      console.log('Automatically refreshing videos...');
      setIsRefreshing(true);
      const startTime = performance.now();

      try {
        const response = await supabase.functions.invoke('manual-fetch-videos');
        if (response.error) throw response.error;
        
        const endTime = performance.now();
        const processingTime = ((endTime - startTime) / 1000).toFixed(2);
        
        await queryClient.invalidateQueries();

        toast({
          title: "Success",
          description: `Videos refreshed in ${processingTime} seconds. ${response.data?.totalVideosProcessed || 0} videos processed.`,
        });
      } catch (error) {
        console.error('Error refreshing videos:', error);
        toast({
          title: "Error",
          description: "Failed to refresh videos. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshVideos();
  }, []); // Run once when component mounts

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 gap-4">
          <FilterBar
            onDateFilterChange={setDateFilter}
            onCreatorFilterChange={setCreatorFilter}
            selectedCreator={creatorFilter}
          />
        </div>
        <VideoGrid dateFilter={dateFilter} creatorFilter={creatorFilter} />
      </main>
    </div>
  );
};

export default Feed;