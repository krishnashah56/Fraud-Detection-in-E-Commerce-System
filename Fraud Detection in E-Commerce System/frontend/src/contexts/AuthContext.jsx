import { createContext, useContext, useEffect, useState } from "react";
import { fetchAdminSession, loginAdmin as apiLoginAdmin, logoutAdmin as apiLogoutAdmin } from "../api/adminApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { user } = await fetchAdminSession();
        setUser(user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (username, password) => {
    setAuthError("");
    try {
      const { user } = await apiLoginAdmin(username, password);
      setUser(user);
      return user;
    } catch (error) {
      setAuthError(error.response?.data?.message || error.message || "Login failed.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogoutAdmin();
    } catch (error) {
      console.warn("Logout error", error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, logout, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
