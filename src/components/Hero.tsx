import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
import HeroHeader from "./hero/HeroHeader";
import VideoStats from "./hero/VideoStats";
import NavigationButtons from "./hero/NavigationButtons";
import TodayVideos from "./hero/TodayVideos";

const Hero = () => {
  const { data: todayVideos, isLoading } = useQuery({
    queryKey: ['todayVideos'],
    queryFn: async () => {
      console.log('Fetching today videos');
      const today = new Date();
      const start = startOfDay(today);
      const end = endOfDay(today);
      
      const { data: videos, error } = await supabase
        .from('youtube_videos')
        .select(`
          *,
          creators!inner(
            subscribers_count,
            channel_url
          )
        `)
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

  return (
    <div className="flex flex-col min-h-[80vh] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 -z-10" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-8 w-full max-w-4xl mx-auto"
      >
        <HeroHeader />
        <VideoStats 
          videoCount={todayVideos?.length || 0}
          isLoading={isLoading}
          lastUpdateTime={lastUpdateTime}
        />
        <NavigationButtons />
        <TodayVideos videos={todayVideos || []} />
      </motion.div>
    </div>
  );
};

export default Hero;