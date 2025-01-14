import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import AddCreatorDialog from "@/components/AddCreatorDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Creator {
  id: string;
  name: string;
  channel_thumbnail: string;
}

const Creators = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const { toast } = useToast();
  
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

  useEffect(() => {
    fetchCreators();
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {creators.map((creator) => (
            <Card key={creator.id} className="aspect-square border border-gray-300">
              <CardContent className="p-4 h-full flex flex-col items-center justify-center gap-2">
                <img
                  src={creator.channel_thumbnail}
                  alt={`${creator.name}'s channel thumbnail`}
                  className="w-20 h-20 rounded-full mb-2"
                />
                <span className="font-medium text-center">{creator.name}</span>
              </CardContent>
            </Card>
          ))}

          <Card 
            className="aspect-square border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => setDialogOpen(true)}
          >
            <CardContent className="p-4 h-full flex flex-col items-center justify-center gap-2">
              <Plus className="w-8 h-8" />
              <span className="font-medium">Add New</span>
            </CardContent>
          </Card>
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