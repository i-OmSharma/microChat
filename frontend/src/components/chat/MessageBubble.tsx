import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isMine: boolean;
  status?: "sent" | "delivered" | "read";
  senderName?: string;
  avatar?: string;
}

const MessageBubble = ({
  content,
  timestamp,
  isMine,
  status = "sent",
  senderName,
  avatar,
}: MessageBubbleProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "sent":
        return <Check className="w-3.5 h-3.5 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="w-3.5 h-3.5 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-2 group", isMine ? "justify-end" : "justify-start")}
    >
      {!isMine && avatar && (
        <img src={avatar} alt={senderName} className="w-8 h-8 rounded-full mt-1" />
      )}
      <div className={cn("max-w-[70%] flex flex-col", isMine ? "items-end" : "items-start")}>
        {!isMine && senderName && (
          <span className="text-xs text-muted-foreground mb-1 ml-1">{senderName}</span>
        )}
        <div className={cn(isMine ? "message-sent" : "message-received")}>
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {timestamp}
          </span>
          {isMine && getStatusIcon()}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
