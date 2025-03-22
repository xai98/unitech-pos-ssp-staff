// AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { consts } from "../utils";

interface AuthContextType {
  isLogin: boolean;
  login: (token: string) => void;
  logout: () => void;
  setIsLogin: (isLogin: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const login = (token: string) => {
    localStorage.setItem(consts.USER_TOKEN, token);
    setIsLogin(true);
  };

  const logout = () => {
    localStorage.removeItem(consts.USER_TOKEN);
    setIsLogin(false);
  };

  return (
    <AuthContext.Provider value={{ isLogin, login, logout,setIsLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
