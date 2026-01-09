import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Paperclip, Send, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
}

const MessageInput = ({ onSend, onTyping }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping?.();
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex items-end gap-2">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAttachments(!showAttachments)}
            className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>
          
          <AnimatePresence>
            {showAttachments && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full mb-2 left-0 p-2 rounded-xl bg-surface border border-border shadow-lg"
              >
                <div className="flex gap-2">
                  <button className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <Image className="w-5 h-5 text-primary" />
                  </button>
                  <button className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <File className="w-5 h-5 text-secondary" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <Smile className="w-5 h-5" />
        </motion.button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full input-chat resize-none min-h-[44px] max-h-[120px] pr-12"
          />
        </div>

        <AnimatePresence>
          {message.trim() && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/25"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MessageInput;
