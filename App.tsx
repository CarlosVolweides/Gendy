import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UserExample } from './src/views/userExample';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Hola mundo! esto es Gendy app</Text>
      <UserExample />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
