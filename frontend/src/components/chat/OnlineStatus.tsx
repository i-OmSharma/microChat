import { cn } from "@/lib/utils";

interface OnlineStatusProps {
  isOnline: boolean;
  lastSeen?: string;
}

const OnlineStatus = ({ isOnline, lastSeen }: OnlineStatusProps) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-success animate-pulse-soft" : "bg-muted-foreground"
        )}
      />
      <span className="text-sm text-muted-foreground">
        {isOnline ? "Active now" : `Last seen ${lastSeen}`}
      </span>
    </div>
  );
};

export default OnlineStatus;
