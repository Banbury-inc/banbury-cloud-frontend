import React, { createContext, useContext, useState } from 'react';

type ErrorState = {
  title: string;
  messages: string[];
  show: boolean;
  isVisible: boolean;
};

type ErrorContextType = {
  showError: (title: string, messages: string[]) => void;
  hideError: () => void;
  error: ErrorState;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<ErrorState>({
    title: '',
    messages: [],
    show: false,
    isVisible: false,
  });

  const showError = (title: string, messages: string[]) => {
    // First mount the component with opacity 0
    setError({
      title,
      messages,
      show: true,
      isVisible: false,
    });

    // Then trigger the fade in after a brief delay
    requestAnimationFrame(() => {
      setError(prev => ({
        ...prev,
        isVisible: true,
      }));
    });

    // Automatically hide error after 5 seconds
    setTimeout(() => {
      hideError();
    }, 5000);
  };

  const hideError = () => {
    // First trigger the fade out
    setError(prev => ({
      ...prev,
      isVisible: false,
    }));

    // Then remove the component after animation completes
    setTimeout(() => {
      setError(prev => ({
        ...prev,
        show: false,
      }));
    }, 300); // Match this with the CSS transition duration
  };

  return (
    <ErrorContext.Provider value={{ showError, hideError, error }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
} 