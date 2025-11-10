import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';

import HomeScreen from '../screens/homeScreen';
import HorariosScreen from '../screens/horariosScreen';
import ActivitiesScreen from '../screens/activitiesScreen';
import SettingsScreen from '../screens/settingsScreen';

import { colors } from '../styles/global';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: '#F9FAFB' },
        tabBarActiveTintColor: colors.primary,
        headerRight: () => (
          <IconButton
            icon="cog"
            iconColor={colors.text}
            onPress={() => navigation.navigate('Settings')}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Horarios"
        component={HorariosScreen}
        options={{ tabBarIcon: ({ color }) => <IconButton icon="clock-outline" iconColor={color} /> }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <IconButton icon="home" iconColor={color} /> }}
      />
      <Tab.Screen
        name="Actividades"
        component={ActivitiesScreen}
        options={{ tabBarIcon: ({ color }) => <IconButton icon="check-circle-outline" iconColor={color} /> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: 'Configuraciones',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
