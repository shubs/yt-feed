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

  const updateSubscriberCounts = async () => {
    console.log('Automatically updating subscriber counts...');
    try {
      const response = await supabase.functions.invoke('update-subscribers');
      if (response.error) throw response.error;

      const successCount = response.data.results.filter(r => r.status === 'success').length;
      const errorCount = response.data.results.filter(r => r.status === 'error').length;

      console.log(`Updated ${successCount} creators successfully${errorCount > 0 ? `. ${errorCount} failed` : ''}.`);
      await queryClient.invalidateQueries();
    } catch (error) {
      console.error('Error updating subscriber counts:', error);
    }
  };

  useEffect(() => {
    updateSubscriberCounts();
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