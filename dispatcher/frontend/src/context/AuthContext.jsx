import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      return urlToken;
    }
    return localStorage.getItem('token') || '';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error fetching user', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.message || 'Invalid credentials');
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch (err) {
      setError('Server error. Please try again.');
      return { success: false, message: 'Server error. Please try again.' };
    }
  };

  const register = async (name, email, password, role) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.message || 'Registration failed');
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err) {
      setError('Server error during registration.');
      return { success: false, message: 'Server error during registration.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    window.location.href = 'http://localhost:8080';
  };

  // Custom authenticated fetch wrapper
  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    // Check if token expired
    if (response.status === 401 && token) {
      console.warn('Unauthorized API call, bypassing redirect for now.');
      // logout();
      // throw new Error('Session expired. Please log in again.');
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, register, apiFetch, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
