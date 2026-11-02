"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe, login as apiLogin, register as apiRegister, clearTokens } from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: "student" | "company" | "university" | "admin";
  profile_photo: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: Parameters<typeof apiRegister>[0]) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const me = await getMe() as User;
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (username: string, password: string) => {
    await apiLogin(username, password);
    await fetchUser();
  };

  const register = async (data: Parameters<typeof apiRegister>[0]) => {
    await apiRegister(data);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
