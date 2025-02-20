import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token") || false
  );
  const [user, setUser] = useState(null);
  const [loading, setLoding] = useState(false);

  const login = async (username, password) => {
    setLoding(true);
    try {
      const response = await fetch("https://smartstock-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "اسم المستخدم أو كلمة المرور غير صحيحة"
        );
      }
      setLoding(false);
      const data = await response.json();
      localStorage.setItem("token", data.token); 
      setIsAuthenticated(true);
      setUser(data.user);
      return true;
    } catch (error) {
      setLoding(false);
      if (error.message === "Failed to fetch") {
        throw new Error("الخادم متوقف حاليًا، يرجى المحاولة لاحقًا");
      }
      console.error("Login error:", error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
