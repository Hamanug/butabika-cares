import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios default config
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // Try to fetch current session (assumes httpOnly cookie will be sent automatically)
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
        if (response.data.authenticated) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
  };

  const logout = async () => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`);
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
