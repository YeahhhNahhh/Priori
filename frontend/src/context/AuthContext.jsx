import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('priori_token');
    const storedUser = localStorage.getItem('priori_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('priori_user', JSON.stringify(userData));
    localStorage.setItem('priori_token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('priori_user');
    localStorage.removeItem('priori_token');
  };

  const fetchUser = async () => {
    if (!user || !user.id || !token) return;
    try {
      const res = await fetch(`/api/patient/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('priori_user', JSON.stringify(data));
      }
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchUser, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
