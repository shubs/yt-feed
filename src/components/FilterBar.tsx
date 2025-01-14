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
}

const FilterBar = ({ onDateFilterChange, onCreatorFilterChange }: FilterBarProps) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-xl font-medium">Filter</span>
      <Select defaultValue="date" onValueChange={onDateFilterChange}>
        <SelectTrigger className="w-[180px] border-2 border-black">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="all" onValueChange={onCreatorFilterChange}>
        <SelectTrigger className="w-[180px] border-2 border-black">
          <SelectValue placeholder="Creators" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Creators</SelectItem>
          <SelectItem value="following">Following</SelectItem>
          <SelectItem value="suggested">Suggested</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterBar;