import VideoCard from "./VideoCard";

const MOCK_VIDEOS = [
  {
    id: 1,
    title: "Getting Started with React",
    views: "1.2K views",
    thumbnail: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Advanced TypeScript Patterns",
    views: "856 views",
    thumbnail: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Building with Tailwind CSS",
    views: "2.1K views",
    thumbnail: "/placeholder.svg",
  },
];

const VideoGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {MOCK_VIDEOS.map((video) => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
};

export default VideoGrid;