import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  youtubeUrl: z.string().url("Please enter a valid YouTube URL"),
});

interface AddCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCreatorDialog = ({ open, onOpenChange }: AddCreatorDialogProps) => {
  const [channelId, setChannelId] = useState("");
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

  const fetchChannelId = async (channelName: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelName}&key=AIzaSyCVnOXgp3OkLiOSs2VJGplq1Qm6KBioJZ4`
      );
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data.items && data.items.length > 0) {
        setChannelId(data.items[0].id.channelId);
      } else {
        toast({
          title: "Channel not found",
          description: "Could not find the channel. Please check the URL and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching channel ID:", error);
      toast({
        title: "Error",
        description: "Failed to fetch channel details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted:", values);
    const channelName = extractChannelName(values.youtubeUrl);
    if (channelName) {
      await fetchChannelId(channelName);
    }
    // Here you would typically save the creator data
    toast({
      title: "Success",
      description: "Creator added successfully!",
    });
    onOpenChange(false);
    form.reset();
    setChannelId("");
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
                          if (channelName) fetchChannelId(channelName);
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