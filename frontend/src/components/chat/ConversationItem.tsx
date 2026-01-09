import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOnline?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const ConversationItem = ({
  avatar,
  name,
  lastMessage,
  time,
  unreadCount = 0,
  isOnline = false,
  isActive = false,
  onClick,
}: ConversationItemProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors",
        isActive ? "bg-primary/20 border border-primary/30" : "hover:bg-surface-hover"
      )}
    >
      <div className="relative flex-shrink-0">
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
        {isOnline && <span className="online-indicator animate-pulse-soft" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-0.5">{lastMessage}</p>
      </div>

      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full gradient-primary text-[11px] font-semibold text-white"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </motion.span>
      )}
    </motion.div>
  );
};

export default ConversationItem;
