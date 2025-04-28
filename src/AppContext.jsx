import React, { createContext, useContext, useState } from 'react';

// Create a context
const AppContext = createContext();

// Create a custom hook for accessing the context
export const useAppContext = () => useContext(AppContext);

// Create a context provider component
export function AppContextProvider({ children }) {
  // Define context state and values
  const [basename, setBasename] = useState('/');

  // You can provide other values in the context as well

  return (
    <AppContext.Provider value={{ basename }}>
      {children}
    </AppContext.Provider>
  );
}
