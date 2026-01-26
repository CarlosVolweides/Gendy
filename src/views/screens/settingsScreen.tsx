import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { 
  Text, 
  Button, 
  Modal, 
  Portal, 
  TextInput, 
  List, 
  RadioButton,
  IconButton,
  Divider
} from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../context/ThemeContext';

interface ScheduleDay {
  day: string;
  startTime: string;
  endTime: string;
}

interface Subject {
  id: string;
  title: string;
  schedules: ScheduleDay[];
  color: string;
}

interface Schedule {
  id: string;
  name: string;
  subjects: Subject[];
}

interface SettingItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  variant?: 'default' | 'danger';
}

function SettingItem({ icon, label, onPress, variant = 'default' }: SettingItemProps) {
  return (
    <SettingItemContainer onPress={onPress} variant={variant}>
      <SettingItemContent>
        <IconButton 
          icon={icon} 
          iconColor={variant === 'danger' ? '#DC2626' : '#4B5563'} 
          size={20}
        />
        <Text variant="bodyLarge" style={{ 
          color: variant === 'danger' ? '#DC2626' : '#1F2937',
          flex: 1 
        }}>
          {label}
        </Text>
        <IconButton 
          icon="chevron-right" 
          iconColor="#9CA3AF" 
          size={20}
        />
      </SettingItemContent>
    </SettingItemContainer>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <SectionContainer>
      <SectionTitle>{title}</SectionTitle>
      <SectionContent>
        {children}
      </SectionContent>
    </SectionContainer>
  );
}

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }: { theme: any }) => theme?.colors?.background || '#fff'};
`;

const Content = styled.View`
  padding: 16px;
`;

const Title = styled(Text)`
  color: #60A5FA;
  font-size: 20px;
  text-align: center;
  margin-bottom: 24px;
`;

const SectionContainer = styled.View`
  margin-bottom: 24px;
`;

const SectionTitle = styled(Text)`
  color: #9CA3AF;
  font-size: 14px;
  margin-bottom: 12px;
  padding-left: 8px;
`;

const SectionContent = styled.View`
  background-color: #fff;
  border-radius: 24px;
  padding: 8px;
  border: 1px solid #F3F4F6;
`;

const SettingItemContainer = styled.TouchableOpacity<{ variant: 'default' | 'danger' }>`
  padding: 16px;
  border-radius: 16px;
`;

const SettingItemContent = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: #fff;
  padding: 24px;
  margin: 20px;
  border-radius: 16px;
`;

const RadioButtonContainer = styled.TouchableOpacity<{ selected: boolean; backgroundColor: string; borderColor: string }>`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${({ borderColor }) => borderColor};
  background-color: ${({ backgroundColor }) => backgroundColor};
  margin-bottom: 8px;
`;

export default function SettingsScreen() {
  const route = useRoute();
  const schedules: Schedule[] = (route.params as any)?.schedules || [];
  const { theme, themeMode } = useTheme();

  const [isNameDialogOpen, setIsNameDialogOpen] = React.useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);
  const [selectedScheduleToExport, setSelectedScheduleToExport] = React.useState<string>('');
  const [userName, setUserName] = React.useState('Usuario');

  const handleExport = async () => {
    const scheduleToExport = schedules.find(s => s.id === selectedScheduleToExport);
    if (!scheduleToExport) return;

    try {
      // Crear el objeto de datos a exportar
      const exportData = {
        name: scheduleToExport.name,
        subjects: scheduleToExport.subjects,
        exportDate: new Date().toISOString(),
      };

      // Convertir a JSON
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Crear el nombre del archivo
      const fileName = `gendy-${scheduleToExport.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      const fileUri = `${(await FileSystem.getDocumentDirectoryAsync())}${fileName}`;

      // Escribir el archivo
      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: 'utf8',
      });

      // Compartir el archivo
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        console.log('Sharing is not available on this platform');
      }

      // Cerrar el modal
      setIsExportDialogOpen(false);
      setSelectedScheduleToExport('');
    } catch (error) {
      console.error('Error exporting schedule:', error);
    }
  };

  return (
    <Container>
      <Content>
        <Title variant="titleLarge">Configuraciones</Title>

        {/* Importar/Exportar */}
        <SettingSection title="Datos">
          <SettingItem
            icon="upload"
            label="Importar"
            onPress={() => console.log('Importar')}
          />
          <SettingItem
            icon="download"
            label="Exportar"
            onPress={() => setIsExportDialogOpen(true)}
          />
        </SettingSection>

        {/* Preferencias */}
        <SettingSection title="Preferencias">
          <SettingItem
            icon="palette"
            label="Tema"
            onPress={() => console.log('Cambiar tema')}
          />
          <SettingItem
            icon="bell"
            label="Notificaciones"
            onPress={() => console.log('Configurar notificaciones')}
          />
        </SettingSection>

        {/* Cuenta */}
        <SettingSection title="Cuenta">
          <SettingItem
            icon="account"
            label="Editar perfil"
            onPress={() => setIsNameDialogOpen(true)}
          />
        </SettingSection>

        {/* Información */}
        <SettingSection title="Información">
          <SettingItem
            icon="information"
            label="Acerca de"
            onPress={() => console.log('Acerca de')}
          />
          <SettingItem
            icon="file-document"
            label="Términos y condiciones"
            onPress={() => console.log('Términos y condiciones')}
          />
          <SettingItem
            icon="shield"
            label="Política de privacidad"
            onPress={() => console.log('Política de privacidad')}
          />
        </SettingSection>

        {/* Dialog para cambiar nombre */}
        <Portal>
          <Modal
            visible={isNameDialogOpen}
            onDismiss={() => setIsNameDialogOpen(false)}
            contentContainerStyle={{ backgroundColor: theme.colors.surface, padding: 24, margin: 20, borderRadius: 16 }}
          >
            <Text variant="titleLarge" style={{ color: theme.colors.text, marginBottom: 8 }}>Cambiar nombre</Text>
            <Text variant="bodyMedium" style={{ marginBottom: 16, color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280' }}>
              Ingresa tu nuevo nombre de usuario
            </Text>
            <TextInput
              label="Nombre"
              value={userName}
              onChangeText={setUserName}
              placeholder="Tu nombre"
              mode="outlined"
              style={{ marginBottom: 16, backgroundColor: themeMode === 'dark' ? '#1E293B' : '#F3F4F6' }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                mode="outlined"
                onPress={() => setIsNameDialogOpen(false)}
                style={{ flex: 1 }}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setIsNameDialogOpen(false);
                  // Aquí iría la lógica para guardar el nombre
                }}
                style={{ flex: 1, backgroundColor: '#06B6D4' }}
              >
                Guardar
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Dialog para exportar horario */}
        <Portal>
          <Modal
            visible={isExportDialogOpen}
            onDismiss={() => {
              setIsExportDialogOpen(false);
              setSelectedScheduleToExport('');
            }}
            contentContainerStyle={{ backgroundColor: theme.colors.surface, padding: 24, margin: 20, borderRadius: 16 }}
          >
            <Text variant="titleLarge" style={{ color: theme.colors.text, marginBottom: 8 }}>Exportar horario</Text>
            <Text variant="bodyMedium" style={{ marginBottom: 16, color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280' }}>
              Selecciona el horario que deseas exportar
            </Text>
            <ScrollView style={{ maxHeight: 300, marginBottom: 16 }}>
              {schedules.length === 0 ? (
                <Text variant="bodyMedium" style={{ textAlign: 'center', color: themeMode === 'dark' ? '#9CA3AF' : '#9CA3AF', padding: 16 }}>
                  No hay horarios disponibles
                </Text>
              ) : (
                schedules.map((schedule) => (
                  <RadioButtonContainer
                    key={schedule.id}
                    selected={selectedScheduleToExport === schedule.id}
                    backgroundColor={selectedScheduleToExport === schedule.id 
                      ? (themeMode === 'dark' ? '#1E3A5F' : '#ECFEFF')
                      : theme.colors.surface}
                    borderColor={selectedScheduleToExport === schedule.id 
                      ? '#06B6D4'
                      : (themeMode === 'dark' ? '#374151' : '#E5E7EB')}
                    onPress={() => setSelectedScheduleToExport(schedule.id)}
                  >
                    <RadioButton
                      value={schedule.id}
                      status={selectedScheduleToExport === schedule.id ? 'checked' : 'unchecked'}
                      onPress={() => setSelectedScheduleToExport(schedule.id)}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text variant="bodyLarge" style={{ fontWeight: '500', color: theme.colors.text }}>
                        {schedule.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                        {schedule.subjects.length} {schedule.subjects.length === 1 ? 'materia' : 'materias'}
                      </Text>
                    </View>
                    {selectedScheduleToExport === schedule.id && (
                      <IconButton icon="check" iconColor="#06B6D4" size={20} />
                    )}
                  </RadioButtonContainer>
                ))
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                mode="outlined"
                onPress={() => {
                  setIsExportDialogOpen(false);
                  setSelectedScheduleToExport('');
                }}
                style={{ flex: 1 }}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleExport}
                disabled={!selectedScheduleToExport}
                icon="download"
                style={{ flex: 1, backgroundColor: '#06B6D4' }}
              >
                Exportar
              </Button>
            </View>
          </Modal>
        </Portal>
      </Content>
    </Container>
  );
}
