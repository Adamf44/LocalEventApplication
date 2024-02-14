import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Create a new context for authentication
const AuthContext = createContext();

// AuthContext provider component
export const AuthProvider = ({ children }) => {
  // State to manage authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Effect to update authentication status on mount
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Provider value containing authentication state and setter function
  const providerValue = {
    isAuthenticated,
    setIsAuthenticated,
  };

  // Return the AuthContext provider with its children
  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the AuthContext
export const useAuth = () => {
  return React.useContext(AuthContext);
};
