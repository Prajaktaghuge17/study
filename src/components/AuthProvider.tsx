import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface UserDetails {
  name: string;
  age: number;
  role: string;
}

interface AuthContextType {
  currentUser: User | null;
  userDetails: UserDetails | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Mock user details fetch
        const mockUserDetails = { name: 'John Doe', age: 30, role: 'Student' };
        setUserDetails(mockUserDetails);
      } else {
        setUserDetails(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userDetails, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
