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
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  youtubeUrl: z.string().url({
    message: "Please enter a valid YouTube URL.",
  }),
});

interface AddCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatorAdded?: () => void;  // Made optional to maintain backwards compatibility
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
      name: "",
      youtubeUrl: "",
    },
  });

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

      // First, search for the channel
      const searchResponse = await fetch(
        `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${channelHandle}&type=channel&key=AIzaSyC3HQ6oKt_j9MkwV7LSfO_WXXL-v2_7OOY`
      );
      const searchData = await searchResponse.json();
      console.log("Channel search API Response:", searchData);

      if (!searchData.items?.length) {
        toast({
          title: "Error",
          description: "Channel not found",
          variant: "destructive",
        });
        return;
      }

      const channelId = searchData.items[0].id.channelId;

      // Then, get detailed channel information
      const channelResponse = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=AIzaSyC3HQ6oKt_j9MkwV7LSfO_WXXL-v2_7OOY`
      );
      const channelData = await channelResponse.json();
      console.log("Channel details API Response:", channelData);

      if (!channelData.items?.length) {
        toast({
          title: "Error",
          description: "Could not fetch channel details",
          variant: "destructive",
        });
        return;
      }

      const channelDetails = channelData.items[0];

      // Check if creator already exists
      const { data: existingCreator } = await supabase
        .from('creators')
        .select('id')
        .eq('channel_id', channelId)
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
        channel_url: `https://youtube.com/channel/${channelId}`,
        channel_id: channelId,
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

      toast({
        title: "Success",
        description: "Creator added successfully",
      });

      form.reset();
      onOpenChange(false);
      onCreatorAdded?.();  // Call the callback if provided
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Creator name" {...field} />
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
