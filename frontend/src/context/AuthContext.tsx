import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  region: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, region: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('transitops_token');
    const storedUser = localStorage.getItem('transitops_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;
      
      localStorage.setItem('transitops_token', receivedToken);
      localStorage.setItem('transitops_user', JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, region: string) => {
    try {
      const response = await API.post('/auth/register', { name, email, password, region });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('transitops_token', receivedToken);
      localStorage.setItem('transitops_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updatedUser: Partial<User>) => {
    if (user) {
      const newProfile = { ...user, ...updatedUser };
      localStorage.setItem('transitops_user', JSON.stringify(newProfile));
      setUser(newProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
