import { motion } from "framer-motion";

interface TypingIndicatorProps {
  name: string;
}

const TypingIndicator = ({ name }: TypingIndicatorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 p-3"
    >
      <div className="message-received flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{name} is typing...</span>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
