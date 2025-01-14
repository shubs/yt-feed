import { useState } from "react";
import Navigation from "@/components/Navigation";
import VideoGrid from "@/components/VideoGrid";
import FilterBar from "@/components/FilterBar";

const Feed = () => {
  const [dateFilter, setDateFilter] = useState("date");
  const [creatorFilter, setCreatorFilter] = useState("all");

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
        <FilterBar
          onDateFilterChange={setDateFilter}
          onCreatorFilterChange={setCreatorFilter}
          selectedCreator={creatorFilter}
        />
        <VideoGrid dateFilter={dateFilter} creatorFilter={creatorFilter} />
      </main>
    </div>
  );
};

export default Feed;