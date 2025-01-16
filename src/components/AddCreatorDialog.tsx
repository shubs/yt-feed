import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  youtubeUrl: z.string().url({
    message: "Please enter a valid YouTube URL.",
  }),
});

interface AddCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatorAdded?: () => void;
}

const extractChannelId = (url: string) => {
  const regex = /(?:youtube\.com\/(?:@|c\/|channel\/|user\/)?|youtu\.be\/)([^\/\n\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const AddCreatorDialog = ({ open, onOpenChange, onCreatorAdded }: AddCreatorDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: "",
    },
  });

  const fetchVideos = async () => {
    try {
      console.log("Fetching videos...");
      const { data, error } = await supabase.functions.invoke('fetch-youtube-videos');
      
      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }
      
      console.log("Videos fetched successfully:", data);
      return data;
    } catch (error) {
      console.error("Error in fetchVideos:", error);
      throw error;
    }
  };

  const updateSubscriberCount = async (channelId: string) => {
    try {
      console.log("Updating subscriber count for channel:", channelId);
      const { data, error } = await supabase.functions.invoke('update-subscribers', {
        body: { channelId }
      });
      
      if (error) throw error;
      console.log("Subscriber count updated:", data);
      return data;
    } catch (error) {
      console.error("Error updating subscriber count:", error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      console.log("Form submitted:", values);

      const channelHandle = extractChannelId(values.youtubeUrl);
      if (!channelHandle) {
        toast({
          title: "Error",
          description: "Invalid YouTube URL",
          variant: "destructive",
        });
        return;
      }

      // Call our Edge Function to get channel details
      const { data: channelDetails, error: functionError } = await supabase.functions.invoke(
        'youtube-channel',
        {
          body: { channelHandle }
        }
      );

      if (functionError) {
        console.error("Edge function error:", functionError);
        toast({
          title: "Error",
          description: "Failed to fetch channel details",
          variant: "destructive",
        });
        return;
      }

      // Check if creator already exists
      const { data: existingCreator } = await supabase
        .from('creators')
        .select('id')
        .eq('channel_id', channelDetails.id)
        .maybeSingle();

      if (existingCreator) {
        toast({
          title: "Error",
          description: "This creator has already been added",
          variant: "destructive",
        });
        return;
      }

      // Insert the new creator
      const { error: insertError } = await supabase.from("creators").insert({
        name: channelDetails.snippet.title,
        channel_url: `https://youtube.com/channel/${channelDetails.id}`,
        channel_id: channelDetails.id,
        channel_thumbnail: channelDetails.snippet.thumbnails.default.url,
      });

      if (insertError) {
        console.error("Error inserting creator:", insertError);
        toast({
          title: "Error",
          description: "Failed to add creator",
          variant: "destructive",
        });
        return;
      }

      // Update subscriber count for the new creator
      await updateSubscriberCount(channelDetails.id);

      // Fetch videos for the newly added creator
      await fetchVideos();

      toast({
        title: "Success",
        description: "Creator added and videos fetched successfully",
      });

      form.reset();
      onOpenChange(false);
      onCreatorAdded?.();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Creator</DialogTitle>
          <DialogDescription>
            Add a YouTube creator to track their content.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/@username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Creator"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCreatorDialog;