
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');

      if (accessToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Refresh user data from server to keep it in sync
          const response = await api.get('auth/profile/');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error("Auth check failed:", error);
          // If profile fetch fails, we let the interceptor handle it
          // or log out if unauthorized
          if (error.response && error.response.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('auth/login/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Fetch full profile info
      const profileResponse = await api.get('auth/profile/');
      const userData = profileResponse.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.detail || "Invalid credentials. Please try again.";
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('auth/register/', userData);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      // Collect specific errors from DRF
      let errorMessage = "Registration failed. Please try again.";
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            errorMessage = `${keys[0]}: ${data[keys[0]][0] || data[keys[0]]}`;
          }
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('auth/profile/', profileData);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true, user: response.data };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: error.response?.data?.detail || "Update failed." };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
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
