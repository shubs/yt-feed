import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  onDateFilterChange: (value: string) => void;
  onCreatorFilterChange: (value: string) => void;
  selectedCreator: string;
}

const FilterBar = ({ onDateFilterChange, onCreatorFilterChange, selectedCreator }: FilterBarProps) => {
  const { data: creators } = useQuery({
    queryKey: ['creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-xl font-medium">Filter</span>
      <Select defaultValue="yesterday" onValueChange={onDateFilterChange}>
        <SelectTrigger className="w-[180px] border-2 border-black">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last7days">Last 7 Days</SelectItem>
          <SelectItem value="last15days">Last 15 Days</SelectItem>
        </SelectContent>
      </Select>
      <Select value={selectedCreator} onValueChange={onCreatorFilterChange}>
        <SelectTrigger className="w-[180px] border-2 border-black">
          <SelectValue placeholder="Creators" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Creators</SelectItem>
          {creators?.map((creator) => (
            <SelectItem key={creator.id} value={creator.channel_id}>
              {creator.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterBar;