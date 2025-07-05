import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Tokens {
  access: string;
  refresh: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  tokens: Tokens | null;
  setTokens: (tokens: Tokens | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokens, setTokens] = useState<Tokens | null>(null);

  const value: AuthContextType = {
    isLoggedIn,
    setIsLoggedIn,
    tokens,
    setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
