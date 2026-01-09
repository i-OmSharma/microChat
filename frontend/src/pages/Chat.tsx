import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Search,
  Phone,
  Video,
  MoreVertical,
  Settings,
  LogOut,
  Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data
const conversations = [
  {
    id: "1",
    name: "Lauren Wilson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    lastMessage: "Help me open the door...",
    time: "3h",
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: "2",
    name: "Janice Contreras",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    lastMessage: "Who are these three?",
    time: "6h",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "3",
    name: "Kelly Tran",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    lastMessage: "You will be monitored😊",
    time: "10h",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "4",
    name: "Linda Sullivan",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    lastMessage: "Around 11 a.m.",
    time: "13h",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "5",
    name: "Joan Jones",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    lastMessage: "Is the head cute?",
    time: "17h",
    unreadCount: 1,
    isOnline: true,
  },
];

type MessageStatus = "sent" | "delivered" | "read";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isMine: boolean;
  status: MessageStatus;
}

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Similar to the West Lake and Thousand Island Lake😊",
    timestamp: "9:15 AM",
    isMine: false,
    status: "read",
  },
  {
    id: "2",
    content: "what is that",
    timestamp: "9:20 AM",
    isMine: true,
    status: "read",
  },
  {
    id: "3",
    content: "I want to see some other ways to explain the scenic spots.",
    timestamp: "9:25 AM",
    isMine: false,
    status: "read",
  },
  {
    id: "4",
    content: "I do not know!",
    timestamp: "9:28 AM",
    isMine: true,
    status: "read",
  },
  {
    id: "5",
    content: "I don't use this kind of class very much.",
    timestamp: "9:30 AM",
    isMine: true,
    status: "read",
  },
  {
    id: "6",
    content: "Who are these three?",
    timestamp: "9:31 AM",
    isMine: false,
    status: "read",
  },
];

const Chat = () => {
  const [activeConversation, setActiveConversation] = useState(conversations[1]);
  const [messages, setMessages] = useState(mockMessages);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMine: true,
      status: "sent",
    };
    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - Navigation */}
      <div className="w-20 bg-slate-900 flex flex-col items-center py-6">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-8">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        
        <nav className="flex-1 flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-xl text-white bg-white/20"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => navigate("/")}
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Conversations List */}
      <div className="w-72 bg-card border-r border-border flex flex-col">
        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-muted/50 border-0 rounded-xl"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="px-2">
            {filteredConversations.map((conv) => (
              <motion.div
                key={conv.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setActiveConversation(conv)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-1 ${
                  activeConversation.id === conv.id
                    ? "bg-primary/10"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="relative">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground truncate">{conv.name}</h3>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {conv.unreadCount}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-muted/30">
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">{activeConversation.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[70%]">
                  {!message.isMine && (
                    <img
                      src={activeConversation.avatar}
                      alt={activeConversation.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div
                    className={`px-4 py-3 ${
                      message.isMine
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                        : "bg-card text-foreground rounded-2xl rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="text-center">
              <span className="text-xs text-muted-foreground">9:31am</span>
            </div>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 bg-card border-t border-border">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="h-12 px-4 bg-muted/50 border-0 rounded-full"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="h-12 w-12 bg-primary border-0 text-white rounded-full hover:bg-primary/90"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
