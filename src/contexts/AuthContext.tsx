import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types'; // Assuming User type is defined in src/types

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean; // To handle initial loading of auth state from localStorage
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  useEffect(() => {
    // Try to load auth state from localStorage on initial mount
    try {
      const storedUser = localStorage.getItem('dcp-user');
      const storedToken = localStorage.getItem('dcp-token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to load auth state from localStorage", error);
      // Clear potentially corrupted storage
      localStorage.removeItem('dcp-user');
      localStorage.removeItem('dcp-token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('dcp-user', JSON.stringify(userData));
    localStorage.setItem('dcp-token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dcp-user');
    localStorage.removeItem('dcp-token');
    // Potentially redirect to login or home page here or in the component calling logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token && !!user, user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
