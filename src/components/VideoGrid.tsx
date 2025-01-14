import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import VideoCard from "./VideoCard";
import { subDays, startOfDay, endOfDay } from "date-fns";

interface VideoGridProps {
  dateFilter: string;
  creatorFilter: string;
}

const VideoGrid = ({ dateFilter, creatorFilter }: VideoGridProps) => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', dateFilter, creatorFilter],
    queryFn: async () => {
      let query = supabase
        .from('youtube_videos')
        .select('*');

      // Apply creator filter
      if (creatorFilter !== 'all') {
        query = query.eq('channel_id', creatorFilter);
      }

      // Apply date filter
      const now = new Date();
      
      if (dateFilter === 'yesterday') {
        const yesterday = subDays(now, 1);
        query = query
          .gte('published_at', startOfDay(yesterday).toISOString())
          .lte('published_at', endOfDay(yesterday).toISOString());
      } else if (dateFilter === 'last7days') {
        const sevenDaysAgo = subDays(now, 7);
        query = query.gte('published_at', startOfDay(sevenDaysAgo).toISOString());
      } else if (dateFilter === 'last15days') {
        const fifteenDaysAgo = subDays(now, 15);
        query = query.gte('published_at', startOfDay(fifteenDaysAgo).toISOString());
      }

      // Apply sorting based on filter
      if (dateFilter === 'oldest') {
        query = query.order('published_at', { ascending: true });
      } else {
        // Default to newest first for all other filters
        query = query.order('published_at', { ascending: false });
      }

      console.log('Fetching videos with filter:', dateFilter);
      const { data, error } = await query;
      if (error) throw error;
      console.log('Fetched videos:', data?.length);
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {videos?.map((video) => (
        <VideoCard
          key={video.id}
          title={video.video_title}
          views={video.views || 0}
          thumbnail={video.thumbnail_url}
          channelName={video.channel_name}
          publishedAt={video.published_at}
          videoUrl={video.video_url}
        />
      ))}
    </div>
  );
};

export default VideoGrid;