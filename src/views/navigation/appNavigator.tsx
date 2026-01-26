import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';
import { View } from 'react-native';

import HomeScreen from '../screens/homeScreen';
import HorariosScreen from '../screens/horariosScreen';
import ActivitiesScreen from '../screens/activitiesScreen';
import SettingsScreen from '../screens/settingsScreen';
import { useTheme } from '../../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  const navigation = useNavigation<any>();
  const { theme, themeMode, toggleTheme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        tabBarStyle: { backgroundColor: theme.colors.surface },
        tabBarActiveTintColor: theme.colors.primary,
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon={themeMode === 'light' ? 'weather-night' : 'weather-sunny'}
              iconColor={theme.colors.text}
              onPress={toggleTheme}
            />
            <IconButton
              icon="cog"
              iconColor={theme.colors.text}
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
        ),
      }}
    >
      <Tab.Screen
        name="Horarios"
        component={HorariosScreen}
        options={{ 
          title: 'Gendy',
          tabBarIcon: ({ color }) => <IconButton icon="format-list-bulleted" iconColor={color} /> 
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ 
          title: 'Gendy',
          tabBarIcon: ({ color }) => <IconButton icon="home" iconColor={color} /> 
        }}
      />
      <Tab.Screen
        name="Calendario"
        component={ActivitiesScreen}
        options={{ 
          title: 'Gendy',
          tabBarIcon: ({ color }) => <IconButton icon="calendar" iconColor={color} /> 
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: 'Gendy',
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
