'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  authToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          try {
            const profile = await api.auth.profile(storedToken);
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          } catch (error) {
            console.error('Token validation failed:', error);
            setUser(null);
            setAuthToken(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });
    
    if (!response.authToken) {
      throw new Error('No auth token received from server');
    }

    // Fetch fresh profile to ensure we have the latest admin status
    let userData: User;
    try {
      const profile = await api.auth.profile(response.authToken);
      userData = {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        isVerified: profile.isVerified,
        isAdmin: profile.isAdmin,
        createdAt: profile.createdAt,
      };
    } catch (error) {
      // Fallback to login response if profile fetch fails
      userData = {
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        isVerified: response.isVerified || false,
        isAdmin: response.isAdmin || false,
        createdAt: response.createdAt || new Date().toISOString(),
      };
    }

    // Update state immediately
    setAuthToken(response.authToken);
    setUser(userData);
    
    // Also save to localStorage
    localStorage.setItem('authToken', response.authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // Only clear localStorage, don't update state
    // This prevents the navbar from updating before reload
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Refresh the current page to show logged out state
    window.location.reload();
  };

  const refreshUser = async () => {
    if (!authToken) return;
    
    try {
      const profile = await api.auth.profile(authToken);
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        isLoading,
        isAuthenticated: !!user && !!authToken,
        isAdmin: user?.isAdmin || false,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
