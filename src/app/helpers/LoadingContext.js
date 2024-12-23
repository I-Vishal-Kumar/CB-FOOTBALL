import React, { createContext, useState, useContext } from "react";

// Create a new context
const LoadingContext = createContext();

// Custom hook to use loading context
export const useLoadingContext = () => useContext(LoadingContext);

// Loading context provider component
export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Function to set loading status
    const setLoading = (status) => {
        setIsLoading(status);
    };

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};
