'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { User, setCredentials, clearCredentials, useGetMeQuery } from '@/store/slices/authSlice';
import { RootState } from '@/store';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { data: userData, isLoading: isLoadingUser } = useGetMeQuery(undefined, {
    skip: !isAuthenticated || !localStorage.getItem('token'),
  });
  
  useEffect(() => {
    // Initialize auth state from localStorage
    const token = localStorage.getItem('token');
    
    if (token && userData) {
      dispatch(setCredentials({ user: userData, token }));
    }
    
    setIsInitialized(true);
  }, [dispatch, userData]);
  
  useEffect(() => {
    // Handle authentication redirects
    if (isInitialized && !isLoading && !isLoadingUser) {
      const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
      const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/reset-password/');
      
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      } else if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
        router.push('/home');
      }
    }
  }, [isAuthenticated, isInitialized, isLoading, isLoadingUser, pathname, router]);
  
  const login = (user: User, token: string) => {
    dispatch(setCredentials({ user, token }));
  };
  
  const logout = () => {
    dispatch(clearCredentials());
    router.push('/login');
  };
  
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      dispatch(setCredentials({ 
        user: { ...user, ...userData },
        token: localStorage.getItem('token') || '',
      }));
    }
  };
  
  const value = {
    user,
    isAuthenticated,
    isLoading: isLoading || isLoadingUser || !isInitialized,
    login,
    logout,
    updateUser,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}