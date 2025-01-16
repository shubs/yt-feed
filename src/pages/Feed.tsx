import { useState } from "react";
import Navigation from "@/components/Navigation";
import VideoGrid from "@/components/VideoGrid";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const Feed = () => {
  const [dateFilter, setDateFilter] = useState("date");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingSubscribers, setIsUpdatingSubscribers] = useState(false);
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
      
      await queryClient.invalidateQueries();

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

  const handleUpdateSubscribers = async () => {
    setIsUpdatingSubscribers(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-subscribers');
      
      if (error) throw error;

      const successCount = data.results.filter(r => r.status === 'success').length;
      const errorCount = data.results.filter(r => r.status === 'error').length;

      await queryClient.invalidateQueries();

      toast({
        title: "Success",
        description: `Updated ${successCount} creator${successCount !== 1 ? 's' : ''} successfully${errorCount > 0 ? `. ${errorCount} failed` : ''}.`,
      });
    } catch (error) {
      console.error('Error updating subscriber counts:', error);
      toast({
        title: "Error",
        description: "Failed to update subscriber counts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSubscribers(false);
    }
  };

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
          <div className="flex gap-2">
            <Button
              onClick={handleUpdateSubscribers}
              disabled={isUpdatingSubscribers}
              variant="outline"
              title="Update subscriber counts"
              className="shrink-0 h-10 whitespace-nowrap"
            >
              {isUpdatingSubscribers ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Update Subscribers
            </Button>
            <Button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              variant="outline"
              title="Refresh videos"
              className="shrink-0 h-10 whitespace-nowrap"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>
        <VideoGrid dateFilter={dateFilter} creatorFilter={creatorFilter} />
      </main>
    </div>
  );
};

export default Feed;