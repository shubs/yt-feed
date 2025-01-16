export interface Video {
  id: string;
  video_title: string;
  video_url: string;
  thumbnail_url: string;
  channel_name: string;
  published_at: string;
  views?: number;
  creators?: {
    channel_url: string;
    subscribers_count: number;
  };
}