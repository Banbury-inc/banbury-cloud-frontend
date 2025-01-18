import React, { createContext, useContext, useState } from 'react';

type ErrorState = {
  title: string;
  messages: string[];
  show: boolean;
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
  });

  const showError = (title: string, messages: string[]) => {
    setError({
      title,
      messages,
      show: true,
    });

    // Automatically hide error after 5 seconds
    setTimeout(() => {
      hideError();
    }, 5000);
  };

  const hideError = () => {
    setError(prev => ({
      ...prev,
      show: false,
    }));
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