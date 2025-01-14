import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import VideoCard from "./VideoCard";

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
      if (dateFilter === 'newest') {
        query = query.order('published_at', { ascending: false });
      } else if (dateFilter === 'oldest') {
        query = query.order('published_at', { ascending: true });
      } else {
        query = query.order('published_at', { ascending: false }); // Default to newest
      }

      const { data, error } = await query;
      if (error) throw error;
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