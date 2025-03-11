import { createContext, useContext, useState } from "react";
import { loginUser, logoutUser, registerUser } from "../services/api";

// Create Auth Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();

  const signup = async (formData) => {
    try {
      await registerUser(formData);
    } catch (error) {
      console.error("Signup failed:", error.response?.data?.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      await loginUser({ email, password });
      setUser({ email });
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
