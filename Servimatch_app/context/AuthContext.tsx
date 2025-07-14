import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface Tokens {
  access: string;
  refresh: string;
}

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'cliente' | 'trabajador' | 'admin';
  // Puedes agregar más campos si necesitas
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  tokens: Tokens | null;
  setTokens: (tokens: Tokens | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!tokens?.access) {
        setUser(null);
        return;
      }

      try {
        const res = await fetch('http://192.168.1.51:8000/api/usuarios/me/', {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });

        if (!res.ok) throw new Error('Error al obtener usuario');
        const data = await res.json();
        setUser(data);
      } catch (e) {
        console.error('Error al cargar usuario:', e);
        setUser(null);
      }
    };

    fetchUser();
  }, [tokens]);

  const value: AuthContextType = {
    isLoggedIn,
    setIsLoggedIn,
    tokens,
    setTokens,
    user,
    setUser,
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
