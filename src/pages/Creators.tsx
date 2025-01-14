import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

const Creators = () => {
  // Mock data for creators
  const creators = [
    {
      id: 1,
      name: "Creator Name",
      thumbnail: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">{creators[0].name}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Channel Thumbnail Card */}
          <Card className="aspect-square border border-gray-300">
            <CardContent className="p-4 h-full flex items-center justify-center">
              <img
                src={creators[0].thumbnail}
                alt="Channel Thumbnail"
                className="w-full h-full object-cover"
              />
            </CardContent>
          </Card>

          {/* Add New Card */}
          <Card className="aspect-square border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors">
            <CardContent className="p-4 h-full flex flex-col items-center justify-center gap-2">
              <Plus className="w-8 h-8" />
              <span className="font-medium">Add New</span>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Creators;