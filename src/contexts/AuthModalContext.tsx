import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Define the mode types
export type AuthFormMode = 'signin' | 'signup' | 'reset';

interface AuthModalContextType {
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: AuthFormMode) => void;
  closeAuthModal: () => void;
  authModalMode: AuthFormMode;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthFormMode>('signin');

  const openAuthModal = useCallback((mode: AuthFormMode = 'signin') => {
    try {
      if (mode && ['signin', 'signup', 'reset'].includes(mode)) {
        setAuthModalMode(mode);
      } else {
        // Default to signin if an invalid mode is provided
        setAuthModalMode('signin');
      }
      setIsAuthModalOpen(true);
    } catch (error) {
      console.error("Error opening auth modal:", error);
      // Ensure we have valid defaults even if there's an error
      setAuthModalMode('signin');
      setIsAuthModalOpen(false);
    }
  }, []);

  const closeAuthModal = useCallback(() => {
    try {
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Error closing auth modal:", error);
      // Force close in case of error
      setIsAuthModalOpen(false);
    }
  }, []);

  return (
    <AuthModalContext.Provider 
      value={{
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}; 