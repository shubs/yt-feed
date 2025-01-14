import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  youtubeUrl: z.string().url("Please enter a valid YouTube URL"),
});

interface AddCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatorAdded?: () => void;
}

const AddCreatorDialog = ({ open, onOpenChange, onCreatorAdded }: AddCreatorDialogProps) => {
  const [channelId, setChannelId] = useState("");
  const [channelThumbnail, setChannelThumbnail] = useState("");
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      youtubeUrl: "",
    },
  });

  const extractChannelName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      return pathSegments[pathSegments.length - 1];
    } catch (error) {
      console.error("Error parsing URL:", error);
      return "";
    }
  };

  const fetchChannelDetails = async (channelName: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelName}&key=AIzaSyCVnOXgp3OkLiOSs2VJGplq1Qm6KBioJZ4`
      );
      const data = await response.json();
      console.log("Channel search API Response:", data);
      
      if (data.items && data.items.length > 0) {
        const channelId = data.items[0].id.channelId;
        setChannelId(channelId);
        
        // Fetch channel details to get thumbnail
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=AIzaSyCVnOXgp3OkLiOSs2VJGplq1Qm6KBioJZ4`
        );
        const channelData = await channelResponse.json();
        console.log("Channel details API Response:", channelData);
        
        if (channelData.items && channelData.items.length > 0) {
          const thumbnail = channelData.items[0].snippet.thumbnails.default.url;
          setChannelThumbnail(thumbnail);
        }
      } else {
        toast({
          title: "Channel not found",
          description: "Could not find the channel. Please check the URL and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching channel details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch channel details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchVideosForNewCreator = async () => {
    try {
      const { error } = await supabase.functions.invoke('fetch-youtube-videos');
      if (error) throw error;
      console.log('Successfully triggered video fetch for new creator');
    } catch (error) {
      console.error('Error fetching videos for new creator:', error);
      toast({
        title: "Warning",
        description: "Creator added but failed to fetch videos. They will be fetched in the next scheduled update.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Form submitted:", values);
      
      // Check if creator already exists
      const { data: existingCreator } = await supabase
        .from('creators')
        .select('id')
        .eq('channel_id', channelId)
        .single();

      if (existingCreator) {
        toast({
          title: "Creator already exists",
          description: "This YouTube channel has already been added.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('creators')
        .insert({
          name: values.name,
          channel_url: values.youtubeUrl,
          channel_id: channelId,
          channel_thumbnail: channelThumbnail,
        });

      if (error) throw error;

      // Fetch videos immediately after adding the creator
      await fetchVideosForNewCreator();

      toast({
        title: "Success",
        description: "Creator added successfully!",
      });
      
      onOpenChange(false);
      form.reset();
      setChannelId("");
      setChannelThumbnail("");
      onCreatorAdded?.();
    } catch (error) {
      console.error("Error saving creator:", error);
      toast({
        title: "Error",
        description: "Failed to save creator. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Creator</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter creator name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Channel URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://youtube.com/@channelname" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value) {
                          const channelName = extractChannelName(e.target.value);
                          if (channelName) fetchChannelDetails(channelName);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Channel ID</FormLabel>
              <Input value={channelId} readOnly disabled placeholder="Channel ID will appear here" />
            </div>
            {channelThumbnail && (
              <div className="space-y-2">
                <FormLabel>Channel Thumbnail</FormLabel>
                <img src={channelThumbnail} alt="Channel thumbnail" className="w-20 h-20 rounded-full" />
              </div>
            )}
            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCreatorDialog;