import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [channelUrl, setChannelUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelUrl) {
      toast.error("Please enter a YouTube channel URL");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("creators")
        .insert([{ channel_url: channelUrl }])
        .select();

      if (error) throw error;

      toast.success("Creator added successfully!");
      navigate("/creators");
    } catch (error) {
      toast.error("Failed to add creator");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
          Discover and Track Your Favorite YouTube Creators
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Add your favorite YouTube creators and stay updated with their latest content
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channelUrl">YouTube Channel URL</Label>
              <Input
                id="channelUrl"
                placeholder="https://www.youtube.com/@channel"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Adding..." : "Add Creator"}
            </Button>
          </div>
        </form>
      </div>

      <div className="text-left">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Today's Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-video rounded-t-lg bg-muted" />
              <div className="p-4">
                <h3 className="font-semibold leading-none tracking-tight">Video Title</h3>
                <p className="text-sm text-muted-foreground mt-2">Channel Name</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;