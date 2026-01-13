import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Search,
  Phone,
  Video,
  MoreVertical,
  Settings,
  LogOut,
  Send,
  Users,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { userApi, User, chatApiService, ChatMessage } from "@/lib/api";
import {
  initSocket,
  joinConversation,
  leaveConversation,
  startTyping,
  stopTyping,
  MessagePayload,
  TypingPayload,
  PresencePayload,
} from "@/lib/socket";
import { toast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/UserAvatar";

type MessageStatus = "sent" | "delivered" | "read";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isMine: boolean;
  status: MessageStatus;
  senderId?: string;
  image?: { url: string; publicId: string };
}

interface ActiveChat {
  chatId: string;
  otherUser: User;
  isOnline: boolean;
}

// Notification sound
const notificationSound = typeof Audio !== 'undefined' ? new Audio('/notification.mp3') : null;

const Chat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousChatIdRef = useRef<string | null>(null);

  // Refs to access current state in socket callbacks (avoid stale closures)
  const activeChatRef = useRef<ActiveChat | null>(null);
  const usersRef = useRef<User[]>([]);

  // Keep refs in sync with state
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // Initialize socket and event listeners
  useEffect(() => {
    loadUsers();
    loadBulkPresence();
    const cleanup = setupSocket();

    // Refresh presence periodically
    const presenceInterval = setInterval(loadBulkPresence, 30000);

    return () => {
      cleanup();
      clearInterval(presenceInterval);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadUsers = async () => {
    try {
      const response = await userApi.getAllUsers(1, 50);
      // Filter out current user from the list
      const otherUsers = response.data.filter((u) => u.id !== user?.id);
      setUsers(otherUsers);

      // Initialize online users from their status
      const onlineIds = new Set(
        otherUsers.filter((u) => u.status === "online").map((u) => u.id)
      );
      setOnlineUsers(onlineIds);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const loadBulkPresence = async () => {
    try {
      if (usersRef.current.length === 0) return;
      const userIds = usersRef.current.map((u) => u.id);
      const response = await userApi.getBulkPresence(userIds);

      const onlineIds = new Set(
        response.data
          .filter((p) => p.status === "online")
          .map((p) => p.userId)
      );
      setOnlineUsers(onlineIds);

      // Update users list with latest presence
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          const presence = response.data.find((p) => p.userId === u.id);
          return presence ? { ...u, status: presence.status, lastSeen: presence.lastSeen } : u;
        })
      );
    } catch (error) {
      console.error("Failed to load presence:", error);
    }
  };

  const playNotificationSound = () => {
    try {
      if (notificationSound) {
        notificationSound.currentTime = 0;
        notificationSound.volume = 0.5;
        notificationSound.play().catch(() => {});
      }
    } catch {}
  };

  const showNotification = (senderName: string, content: string) => {
    toast({
      title: `New message from ${senderName}`,
      description: content.length > 50 ? content.substring(0, 50) + "..." : content,
    });
    playNotificationSound();
  };

  const setupSocket = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return () => {};

    const socket = initSocket(token);

    // Handle incoming messages
    const handleMessage = (message: MessagePayload) => {
      const currentChat = activeChatRef.current;
      const currentUsers = usersRef.current;

      // Find sender info for notification
      const sender = currentUsers.find((u) => u.id === message.senderId);
      const senderName = sender?.name || "Someone";

      // If message is for the active chat, add it to messages
      if (currentChat && message.conversationId === currentChat.chatId) {
        const newMessage: Message = {
          id: message.messageId,
          content: message.content || "",
          timestamp: new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMine: message.senderId === user?.id,
          status: "delivered",
          senderId: message.senderId,
        };
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        // Show notification if not our own message
        if (message.senderId !== user?.id) {
          showNotification(senderName, message.content || "New message");
        }
      } else if (message.senderId !== user?.id) {
        // Message for another chat - show notification
        showNotification(senderName, message.content || "New message");
      }
    };

    // Handle typing updates
    const handleTyping = (data: TypingPayload) => {
      if (data.isTyping) {
        setTypingUsers((prev) => new Set([...prev, data.userId]));
      } else {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    };

    // Handle presence updates
    const handlePresence = (data: PresencePayload) => {
      if (data.status === "online") {
        setOnlineUsers((prev) => new Set([...prev, data.userId]));
      } else {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }

      // Update user status in the users list
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === data.userId ? { ...u, status: data.status } : u
        )
      );

      // Update active chat if it's the other user
      setActiveChat((prevChat) => {
        if (prevChat && prevChat.otherUser.id === data.userId) {
          return { ...prevChat, isOnline: data.status === "online" };
        }
        return prevChat;
      });
    };

    // Register event listeners
    socket.on("message:receive", handleMessage);
    socket.on("message:new", handleMessage);
    socket.on("typing:update", handleTyping);
    socket.on("presence:update", handlePresence);

    socket.on("connect", () => {
      console.log("Connected to chat server");
      loadBulkPresence(); // Refresh presence on reconnect
    });

    // Return cleanup function
    return () => {
      socket.off("message:receive", handleMessage);
      socket.off("message:new", handleMessage);
      socket.off("typing:update", handleTyping);
      socket.off("presence:update", handlePresence);
    };
  };

  const handleSelectUser = useCallback(async (selectedUser: User) => {
    if (!user?.id) return;

    // Leave previous conversation
    if (previousChatIdRef.current) {
      leaveConversation(previousChatIdRef.current);
    }

    setIsLoadingMessages(true);
    setMessages([]);

    try {
      // Create or get existing chat
      const chatResponse = await chatApiService.createOrGetChat(selectedUser.id);
      const chatId = chatResponse.chatId;

      setActiveChat({
        chatId,
        otherUser: selectedUser,
        isOnline: onlineUsers.has(selectedUser.id) || selectedUser.status === "online",
      });

      // Join socket room for real-time updates
      joinConversation(chatId);
      previousChatIdRef.current = chatId;

      // Load message history
      const messagesResponse = await chatApiService.getMessages(chatId);

      const loadedMessages: Message[] = messagesResponse.messages.map((msg: ChatMessage) => ({
        id: msg._id,
        content: msg.text || "",
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMine: msg.sender === user.id,
        status: msg.seen ? "read" : "delivered",
        senderId: msg.sender,
        image: msg.image,
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error("Failed to load chat:", error);
      toast({
        title: "Error",
        description: "Failed to load chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user?.id, onlineUsers]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChat || isSending) return;

    const messageText = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMine: true,
      status: "sent",
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Send via Chat Service API
      const response = await chatApiService.sendMessage(activeChat.chatId, messageText);

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: response.message._id,
                status: "delivered",
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      // Restore input
      setMessageInput(messageText);
    } finally {
      setIsSending(false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(activeChat.chatId);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!activeChat) return;

    if (!isTyping) {
      setIsTyping(true);
      startTyping(activeChat.chatId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(activeChat.chatId);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
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

        <div className="flex flex-col items-center gap-2">
          <UserAvatar
            name={user?.name || "User"}
            avatar={user?.avatar}
            size="md"
          />
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Users List */}
      <div className="w-72 bg-card border-r border-border flex flex-col">
        {/* User Info */}
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-muted/50 border-0 rounded-xl"
            />
          </div>
        </div>

        {/* Users List */}
        <ScrollArea className="flex-1">
          <div className="px-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isOnline = onlineUsers.has(u.id) || u.status === "online";
                const isSelected = activeChat?.otherUser.id === u.id;

                return (
                  <motion.div
                    key={u.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleSelectUser(u)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-1 ${
                      isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                    }`}
                  >
                    <UserAvatar
                      name={u.name}
                      avatar={u.avatar}
                      size="lg"
                      showOnlineIndicator
                      isOnline={isOnline}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{u.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-muted/30">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={activeChat.otherUser.name}
                  avatar={activeChat.otherUser.avatar}
                  size="md"
                  showOnlineIndicator
                  isOnline={activeChat.isOnline || onlineUsers.has(activeChat.otherUser.id)}
                />
                <div>
                  <h2 className="font-semibold text-foreground">{activeChat.otherUser.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {activeChat.isOnline || onlineUsers.has(activeChat.otherUser.id) ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      "Offline"
                    )}
                    {typingUsers.has(activeChat.otherUser.id) && " • Typing..."}
                  </p>
                </div>
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
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-end gap-2 max-w-[70%]">
                        {!message.isMine && (
                          <UserAvatar
                            name={activeChat.otherUser.name}
                            avatar={activeChat.otherUser.avatar}
                            size="sm"
                          />
                        )}
                        <div
                          className={`px-4 py-3 ${
                            message.isMine
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                              : "bg-card text-foreground rounded-2xl rounded-bl-md shadow-sm"
                          }`}
                        >
                          {message.image && (
                            <img
                              src={message.image.url}
                              alt="Shared image"
                              className="max-w-full rounded-lg mb-2"
                            />
                          )}
                          {message.content && (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          )}
                          <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
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
                    onChange={handleTyping}
                    onKeyDown={handleKeyPress}
                    disabled={isSending}
                    className="h-12 px-4 bg-muted/50 border-0 rounded-full"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  className="h-12 w-12 bg-primary border-0 text-white rounded-full hover:bg-primary/90"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <h2 className="text-xl font-semibold mb-2">Welcome to MicroChat</h2>
              <p>Select a user to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
