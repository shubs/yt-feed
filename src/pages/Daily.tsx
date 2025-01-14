import Navigation from "@/components/Navigation";
import { Calendar } from "@/components/ui/calendar";
import VideoGrid from "@/components/VideoGrid";
import { useState } from "react";
import { startOfDay } from "date-fns";

const Daily = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-auto bg-white rounded-lg shadow-sm border">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-6">
              {selectedDate
                ? `Videos from ${selectedDate.toLocaleDateString()}`
                : "Select a date"}
            </h2>
            {selectedDate && (
              <VideoGrid
                dateFilter="custom"
                creatorFilter="all"
                customDate={startOfDay(selectedDate)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Daily;