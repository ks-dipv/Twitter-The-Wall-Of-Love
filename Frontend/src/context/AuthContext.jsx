import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser, registerUser } from "../services/api";
import Cookies from "js-cookie";

// Create Auth Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
    }
  }, []);

  const signup = async (formData) => {
    try {
      await registerUser(formData);
    } catch (error) {
      console.error("Signup failed:", error.response?.data?.message);
      throw error;
    }
  };

  const login = async (userData) => {
    try {
      const response = await loginUser(userData);

      const { token } = response.data;
      // Store the token in a cookie named 'Access'
      Cookies.set("access_token", token, {
        secure: true,
        sameSite: "Strict",
      });
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data)); // Store response.data instead of userData
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      // Clear everything
      setUser(null);
      localStorage.removeItem("user");
      Cookies.remove("access_token"); // Also remove the token cookie
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the API call fails, we should clear local state
      setUser(null);
      localStorage.removeItem("user");
      Cookies.remove("access_token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);