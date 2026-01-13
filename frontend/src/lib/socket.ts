import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export interface MessagePayload {
  conversationId: string;
  messageId: string;
  content: string;
  senderId: string;
  timestamp: number;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresencePayload {
  userId: string;
  status: 'online' | 'offline' | 'away';
}

export const initSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conversationId: string): void => {
  socket?.emit('conversation:join', conversationId);
};

export const leaveConversation = (conversationId: string): void => {
  socket?.emit('conversation:leave', conversationId);
};

export const sendMessage = (payload: Omit<MessagePayload, 'timestamp'>): void => {
  socket?.emit('message:send', payload);
};

export const markMessageDelivered = (messageId: string, conversationId: string): void => {
  socket?.emit('message:delivered', { messageId, conversationId });
};

export const markMessageRead = (messageId: string, conversationId: string): void => {
  socket?.emit('message:read', { messageId, conversationId });
};

export const startTyping = (conversationId: string): void => {
  socket?.emit('typing:start', { conversationId });
};

export const stopTyping = (conversationId: string): void => {
  socket?.emit('typing:stop', { conversationId });
};

export const updatePresence = (status: 'online' | 'away'): void => {
  socket?.emit('presence:update', status);
};

export const onNewMessage = (callback: (message: MessagePayload) => void): void => {
  socket?.on('message:new', callback);
};

export const onMessageReceive = (callback: (message: MessagePayload) => void): void => {
  socket?.on('message:receive', callback);
};

export const onMessageDelivered = (callback: (data: { messageId: string; userId: string; timestamp: number }) => void): void => {
  socket?.on('message:delivered', callback);
};

export const onMessageRead = (callback: (data: { messageId: string; userId: string; timestamp: number }) => void): void => {
  socket?.on('message:read', callback);
};

export const onTypingUpdate = (callback: (data: TypingPayload) => void): void => {
  socket?.on('typing:update', callback);
};

export const onPresenceUpdate = (callback: (data: PresencePayload) => void): void => {
  socket?.on('presence:update', callback);
};

export const offNewMessage = (callback?: (message: MessagePayload) => void): void => {
  socket?.off('message:new', callback);
};

export const offTypingUpdate = (callback?: (data: TypingPayload) => void): void => {
  socket?.off('typing:update', callback);
};

export const offPresenceUpdate = (callback?: (data: PresencePayload) => void): void => {
  socket?.off('presence:update', callback);
};
