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
  logout: () => void;
  updateUserProfile: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('transitops_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    // Check URL first (coming from portal SSO redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      localStorage.setItem('transitops_token', urlToken);
      // Clean token from URL bar immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      return urlToken;
    }
    return localStorage.getItem('transitops_token');
  });

  const [loading, setLoading] = useState<boolean>(false);

  // If token came from URL but we have no user yet, fetch profile
  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      API.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          const userData = res.data;
          localStorage.setItem('transitops_user', JSON.stringify(userData));
          setUser(userData);
        })
        .catch(() => {
          // Profile fetch failed — keep token; pages will show with limited user data
        })
        .finally(() => setLoading(false));
    }
  }, []);


  const logout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    setToken(null);
    setUser(null);
    window.location.href = 'http://localhost:8080';
  };

  const updateUserProfile = (updatedUser: Partial<User>) => {
    if (user) {
      const newProfile = { ...user, ...updatedUser };
      localStorage.setItem('transitops_user', JSON.stringify(newProfile));
      setUser(newProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, updateUserProfile }}>
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
