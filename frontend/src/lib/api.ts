import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    errors?: Array<{ field: string; message: string }>;
  };
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export interface SignupResponse {
  message: string;
  isNewUser: boolean;
}

export interface LoginResponse {
  message: string;
  isNewUser: boolean;
}

export interface VerifyResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    status: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  status: string;
  lastSeen?: string;
}

export const authApi = {
  signup: async (email: string, name: string): Promise<ApiResponse<SignupResponse>> => {
    const response = await api.post('/auth/signup', { email, name });
    return response.data;
  },

  login: async (email: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/auth/login', { email });
    return response.data;
  },

  verify: async (email: string, otp: string): Promise<ApiResponse<VerifyResponse>> => {
    const response = await api.post('/auth/verify', { email, otp });
    return response.data;
  },

  googleAuth: async (idToken: string): Promise<ApiResponse<VerifyResponse>> => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },
};

// Chat Service API (runs on port 5002)
const CHAT_API_BASE_URL = import.meta.env.VITE_CHAT_API_BASE_URL || 'http://localhost:5002/api/v1';

const chatApi: AxiosInstance = axios.create({
  baseURL: CHAT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add auth interceptor for chat API
chatApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface ChatMessage {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  messageType: string;
  image?: { url: string; publicId: string };
  seen: boolean;
  seenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  users: string[];
  latestMessage?: { text: string; sender: string };
  createdAt: string;
  updatedAt: string;
}

export interface ChatWithUser {
  user: User | { _id: string; name: string };
  chat: Chat & { unseenCount: number };
}

export const chatApiService = {
  createOrGetChat: async (otherUserId: string): Promise<{ message: string; chatId: string }> => {
    const response = await chatApi.post('/chat/new', { otherUserId });
    return response.data;
  },

  getAllChats: async (): Promise<{ chat: ChatWithUser[] }> => {
    const response = await chatApi.get('/chat/all');
    return response.data;
  },

  getMessages: async (chatId: string): Promise<{ messages: ChatMessage[]; user: User | { _id: string; name: string } }> => {
    const response = await chatApi.get(`/message/${chatId}`);
    return response.data;
  },

  sendMessage: async (chatId: string, text: string): Promise<{ message: ChatMessage; sender: string }> => {
    const response = await chatApi.post('/message', { chatId, text });
    return response.data;
  },

  sendMessageWithImage: async (chatId: string, text: string, image: File): Promise<{ message: ChatMessage; sender: string }> => {
    const formData = new FormData();
    formData.append('chatId', chatId);
    if (text) formData.append('text', text);
    formData.append('image', image);

    const response = await chatApi.post('/message', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: { name?: string; bio?: string }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string; expiresIn: number }>> => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  uploadAvatar: async (base64Image: string): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string; expiresIn: number }>> => {
    const response = await api.post('/users/me/avatar', { image: base64Image });
    return response.data;
  },

  getAllUsers: async (page = 1, limit = 20): Promise<ApiResponse<User[]> & { pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    const response = await api.get('/users', { params: { page, limit } });
    return response.data;
  },

  searchUsers: async (query: string, limit = 20): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/users/search', { params: { q: query, limit } });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getPresence: async (id: string): Promise<ApiResponse<{ userId: string; status: string; lastSeen: string }>> => {
    const response = await api.get(`/users/${id}/presence`);
    return response.data;
  },

  getBulkPresence: async (userIds: string[]): Promise<ApiResponse<Array<{ userId: string; status: string; lastSeen: string }>>> => {
    const response = await api.post('/users/presence/bulk', { userIds });
    return response.data;
  },
};

export default api;
