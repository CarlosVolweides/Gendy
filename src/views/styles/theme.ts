import { MD3LightTheme as DefaultPaperTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...DefaultPaperTheme,
  colors: {
    ...DefaultPaperTheme.colors,
    primary: '#4F46E5',
    secondary: '#6366F1',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#1F2937'
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8',
    secondary: '#A5B4FC',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F9FAFB',
  },
};
