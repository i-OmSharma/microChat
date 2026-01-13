import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, User } from '@/lib/api';
import { initSocket, disconnectSocket } from '@/lib/socket';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (email: string, name: string) => Promise<{ success: boolean; message?: string }>;
  login: (email: string) => Promise<{ success: boolean; message?: string }>;
  verify: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  googleAuth: (idToken: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        initSocket(accessToken);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (email: string, name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authApi.signup(email, name);
      return { success: true, message: response.data?.message || response.message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      return {
        success: false,
        message: err.response?.data?.error?.message || 'Failed to create account',
      };
    }
  }, []);

  const login = useCallback(async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authApi.login(email);
      return { success: true, message: response.data?.message || response.message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      return {
        success: false,
        message: err.response?.data?.error?.message || 'Failed to send OTP',
      };
    }
  }, []);

  const verify = useCallback(async (email: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authApi.verify(email, otp);
      const { user: userData, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      initSocket(accessToken);

      return { success: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      return {
        success: false,
        message: err.response?.data?.error?.message || 'Invalid OTP',
      };
    }
  }, []);

  const googleAuth = useCallback(async (idToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authApi.googleAuth(idToken);
      const { user: userData, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      initSocket(accessToken);

      return { success: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      return {
        success: false,
        message: err.response?.data?.error?.message || 'Google authentication failed',
      };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Continue with logout even if API fails
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      disconnectSocket();
    }
  }, []);

  const updateUser = useCallback((updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signup,
    login,
    verify,
    googleAuth,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
