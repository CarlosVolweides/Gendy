import React from 'react';
import styled from 'styled-components/native';
import { Text } from 'react-native-paper';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }: { theme: any }) => theme?.colors?.background || '#fff'};
`;  

export default function SettingsScreen() {
  return (
    <Container>
      <Text variant="titleLarge">⚙️ Configuraciones</Text>
    </Container>
  );
}
