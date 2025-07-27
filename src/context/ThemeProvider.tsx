import React, {createContext, useContext, ReactNode} from 'react';
import {theme as appTheme} from '../config/theme';

// Define the shape of the theme context
interface ThemeContextType {
  theme: typeof appTheme; // Use typeof appTheme to get the exact type
  toggleTheme: () => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: appTheme, // Provide the actual theme object
  toggleTheme: () => {},
});

// Create the provider component
export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const toggleTheme = () => {
    // For MVP, theme toggling is not fully implemented, always uses default theme
    console.log('Theme toggled (functionality not fully implemented for MVP)');
  };

  return (
    <ThemeContext.Provider value={{theme: appTheme, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create a custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);
