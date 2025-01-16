import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Link2 } from "lucide-react";
import AddCreatorDialog from "@/components/AddCreatorDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Creator {
  id: string;
  name: string;
  channel_thumbnail: string;
  channel_id: string;
  channel_url: string;
  subscribers_count: number;
}

const formatSubscriberCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M subscribers`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K subscribers`;
  }
  return `${count} subscribers`;
};

const Creators = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const { toast } = useToast();
  
  const updateSubscriberCounts = async () => {
    console.log('Automatically updating subscriber counts...');
    try {
      const response = await supabase.functions.invoke('update-subscribers');
      if (response.error) throw response.error;

      const successCount = response.data.results.filter(r => r.status === 'success').length;
      const errorCount = response.data.results.filter(r => r.status === 'error').length;

      console.log(`Updated ${successCount} creators successfully${errorCount > 0 ? `. ${errorCount} failed` : ''}.`);
      await fetchCreators(); // Refresh the creators list after updating
    } catch (error) {
      console.error('Error updating subscriber counts:', error);
    }
  };

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Fetched creators:", data);
      setCreators(data || []);
    } catch (error) {
      console.error("Error fetching creators:", error);
      toast({
        title: "Error",
        description: "Failed to load creators. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (creator: Creator) => {
    try {
      console.log("Starting deletion process for creator:", creator);
      
      const { error: deleteError } = await supabase
        .from('creators')
        .delete()
        .eq('id', creator.id)
        .throwOnError();

      if (deleteError) throw deleteError;

      console.log("Successfully deleted creator and associated videos");
      
      toast({
        title: "Success",
        description: "Creator and associated videos deleted successfully",
      });
      
      await fetchCreators();
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast({
        title: "Error",
        description: "Failed to delete creator. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChannelClick = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetchCreators();
    updateSubscriberCounts();
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card 
            className="aspect-square border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => setDialogOpen(true)}
          >
            <CardContent className="p-4 h-full flex flex-col items-center justify-center gap-2">
              <Plus className="w-8 h-8" />
              <span className="font-medium">Add New</span>
            </CardContent>
          </Card>

          {creators.map((creator) => (
            <Card key={creator.id} className="aspect-square border border-gray-300 group relative">
              <CardContent className="p-4 h-full flex flex-col items-center justify-center gap-2">
                <img
                  src={creator.channel_thumbnail}
                  alt={`${creator.name}'s channel thumbnail`}
                  className="w-20 h-20 rounded-full mb-2"
                />
                <span className="font-medium text-center">{creator.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground text-center">
                    {formatSubscriberCount(creator.subscribers_count || 0)}
                  </span>
                  <button
                    onClick={() => handleChannelClick(creator.channel_url)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Visit channel"
                  >
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                
                <button
                  onClick={() => handleDelete(creator)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Delete creator"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      
      <AddCreatorDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreatorAdded={fetchCreators}
      />
    </div>
  );
};

export default Creators;