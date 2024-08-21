"use client";
import React, { createContext, useState, useContext } from 'react';

// Define the shape of your context
interface GlobalContextType {
  value: string;
  setValue: (value: string) => void;
}

// Create the context with default values
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Create a provider component
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [value, setValue] = useState<string>('');

  return (
    <GlobalContext.Provider value={{ value, setValue }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook for using the context
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};