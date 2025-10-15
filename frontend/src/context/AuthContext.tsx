import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { apiService, setAuthToken } from '../services/apiService';
import { setAuthToken as setAuthTokenApi } from '../services/api';

interface User {
  userid: number;
  name: string;
  email: string;
  age?: number;
  usertypeid: number;
  educationlevelid?: number;
  about?: string;
  createdat?: string;
}

type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'error';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authStatus: AuthStatus;
  authError: string | null;
  clearAuthError: () => void;
  signUp: (name: string, email: string, password: string, age?: number, usertypeid?: number, educationlevelid?: number) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [authError, setAuthError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('yetria_token');
        const storedUser = localStorage.getItem('yetria_user');
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Validate user object structure
          if (parsedUser && parsedUser.userid && parsedUser.email && parsedUser.name) {
            setAuthToken(storedToken);
            setAuthTokenApi(storedToken);
            setUser(parsedUser);
            
            // Verify token is still valid
            try {
              await apiService.getCurrentUser();
            } catch (error) {
              // Token is invalid, clear everything
              localStorage.removeItem('yetria_token');
              localStorage.removeItem('yetria_user');
              setAuthToken(null);
              setAuthTokenApi(null);
              setUser(null);
            }
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('yetria_token');
            localStorage.removeItem('yetria_user');
            setAuthToken(null);
            setAuthTokenApi(null);
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('yetria_token');
        localStorage.removeItem('yetria_user');
        setAuthToken(null);
        setAuthTokenApi(null);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    loadUser();
  }, []);

  // Save user to localStorage whenever user changes (but not during initial load)
  useEffect(() => {
    if (isInitialLoad) {
      return;
    }
    
    if (user) {
      try {
        localStorage.setItem('yetria_user', JSON.stringify(user));
      } catch (error) {
        console.error('Error saving user to storage:', error);
      }
    } else {
      localStorage.removeItem('yetria_user');
      localStorage.removeItem('yetria_token');
      setAuthToken(null);
      setAuthTokenApi(null);
    }
  }, [user, isInitialLoad]);

  const signUp = async (
    name: string, 
    email: string, 
    password: string, 
    age?: number, 
    usertypeid: number = 1, 
    educationlevelid?: number
  ): Promise<boolean> => {
    setIsLoading(true);
    setAuthStatus('authenticating');
    setAuthError(null);
    
    try {
      // Validate inputs
      if (!name.trim() || !email.trim() || !password) {
        const validationMessage = 'Lütfen tüm alanları doldurun';
        setAuthError(validationMessage);
        setAuthStatus('error');
        throw new Error(validationMessage);
      }

      if (password.length < 6) {
        const validationMessage = 'Şifre en az 6 karakter olmalıdır';
        setAuthError(validationMessage);
        setAuthStatus('error');
        throw new Error(validationMessage);
      }

      // Call backend API
      const userData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        age,
        usertypeid,
        educationlevelid
      };

      const response = await apiService.register(userData);
      
      // Store token from registration response
      const token = response.access_token;
      localStorage.setItem('yetria_token', token);
      setAuthToken(token);
      setAuthTokenApi(token);
      
      // Get user info using the new token
      const userInfo = await apiService.getCurrentUser();
      setUser(userInfo);
      
      toast.success('Kayıt başarılı!');
      setAuthStatus('authenticated');
      setAuthError(null);
      return true;
    } catch (error: any) {
      console.error('SignUp error:', error);
      // Hata mesajını paylaş
      const errorMessage = error.message || apiService.getErrorMessage(error);
      setAuthError(errorMessage);
      setAuthStatus('error');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthStatus('authenticating');
    setAuthError(null);
    
    try {
      // Validate inputs
      if (!email.trim() || !password) {
        const validationMessage = 'Lütfen email ve şifre girin';
        setAuthError(validationMessage);
        setAuthStatus('error');
        throw new Error(validationMessage);
      }

      // Call backend API
      const credentials = {
        email: email.toLowerCase().trim(),
        password
      };

      const response = await apiService.login(credentials);
      
      // Store token and get user info
      const token = response.access_token;
      localStorage.setItem('yetria_token', token);
      setAuthToken(token);
      setAuthTokenApi(token);
      
      // Get user info
      const userInfo = await apiService.getCurrentUser();
      setUser(userInfo);
      
      toast.success('Giriş başarılı!');
      setAuthStatus('authenticated');
      setAuthError(null);
      return true;
    } catch (error: any) {
      console.error('SignIn error:', error);
      const errorMessage = error.message || apiService.getErrorMessage(error);
      setAuthError(errorMessage);
      setAuthStatus('error');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    try {
      setUser(null);
      setAuthStatus('idle');
      setAuthError(null);
      localStorage.removeItem('yetria_token');
      localStorage.removeItem('yetria_user');
      setAuthToken(null);
      setAuthTokenApi(null);
      toast.success('Çıkış yapıldı');
    } catch (error) {
      console.error('SignOut error:', error);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setAuthStatus('authenticated');
      toast.success('Profil güncellendi');
    } catch (error) {
      console.error('UpdateProfile error:', error);
      toast.error('Profil güncellenirken bir hata oluştu');
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
    if (authStatus === 'error') {
      setAuthStatus(user ? 'authenticated' : 'idle');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    authStatus,
    authError,
    clearAuthError,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}