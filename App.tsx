import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import AppNavigator from './src/views/navigation/appNavigator';
import { lightTheme, darkTheme } from './src/views/styles/theme';

export default function App() {
  const scheme = useColorScheme(); // detecta dark o light del sistema
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <AppNavigator />
      </ThemeProvider>
    </PaperProvider>
  );
}