import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/views/navigation/appNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ViewModelProvider } from './src/context/ViewModelContext';

function AppContent() {
  const { theme } = useTheme();

  return (
    <PaperProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        <ViewModelProvider>
          <AppNavigator />
        </ViewModelProvider>
      </StyledThemeProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}