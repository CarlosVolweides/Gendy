import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import AppNavigator from './src/views/navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
