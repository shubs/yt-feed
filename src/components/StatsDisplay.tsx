import { Loader2, RefreshCw } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import Button from "./Button";
import { motion } from "framer-motion";

interface StatsDisplayProps {
  videoCount: number;
  lastUpdateTime: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const StatsDisplay = ({ videoCount, lastUpdateTime, isRefreshing, onRefresh }: StatsDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-2 justify-center text-sm text-gray-500"
    >
      {lastUpdateTime && (
        <>
          <span>Last updated video: {formatInTimeZone(new Date(lastUpdateTime), 'Europe/Paris', 'PPP p')}</span>
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ml-2 !p-2 h-8 w-8"
            variant="secondary"
            title="Refresh videos"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </>
      )}
    </motion.div>
  );
};

export default StatsDisplay;