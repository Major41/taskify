"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  avatar_url?: string;
  isTasker: boolean;
  role: "ADMIN" | "SUPER ADMIN" | "USER";
  isPhone_number_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, authToken?: string) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No longer loading from localStorage on app start
    // All authentication state will be managed in context only
    setLoading(false);
  }, []);

  const login = (userData: User, authToken?: string) => {
    setUser(userData);
    if (authToken) {
      setToken(authToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Redirect to login page
    window.location.href = "/";
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
