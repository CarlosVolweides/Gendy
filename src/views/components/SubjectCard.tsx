import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Text, Menu, IconButton, Modal, Portal, TextInput, Button, Icon } from 'react-native-paper';

interface ScheduleDay {
  day: string;
  startTime: string;
  endTime: string;
}

interface SubjectCardProps {
  id: string;
  title: string;
  schedules: ScheduleDay[];
  color: string;
  onUpdate?: (id: string, updatedSubject: { title: string; schedules: ScheduleDay[]; color: string }) => void;
  onDelete?: (id: string) => void;
}

const DAYS_OF_WEEK = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

const TIME_SLOTS = [
  '08:00',
  '08:45',
  '09:30',
  '10:15',
  '11:00',
  '11:45',
  '12:30',
  '13:15',
  '14:00',
  '14:45',
  '15:30',
  '16:15',
  '17:00',
];

const COLOR_OPTIONS = [
  { name: 'Azul', value: '#2563EB' },
  { name: 'Verde', value: '#16A34A' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Naranja', value: '#CA8A04' },
  { name: 'Morado', value: '#9333EA' },
  { name: 'Naranja Rojizo', value: '#EA580C' },
  { name: 'Amarillo', value: '#FACC15' },
  { name: 'Cyan', value: '#06B6D4' },
];

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const CardContainer = styled.View<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ScheduleItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ColorGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const ColorButton = styled.TouchableOpacity<{ color: string; selected: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background-color: ${({ color }) => color};
  align-items: center;
  justify-content: center;
  border-width: ${({ selected }) => (selected ? 3 : 0)}px;
  border-color: #fff;
  margin-right: 12px;
  margin-bottom: 12px;
`;

const ScheduleChip = styled.View`
  background-color: #2563EB;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export function SubjectCard({ id, title, schedules, color, onUpdate, onDelete }: SubjectCardProps) {
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [editedSubject, setEditedSubject] = React.useState({
    title: title,
    schedules: schedules,
    color: color,
  });
  
  const [currentSchedule, setCurrentSchedule] = React.useState({
    day: '',
    startTime: '',
    endTime: '',
  });

  // Use a single state to track which menu is open
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const menuKeyRef = React.useRef(0);

  // Helper to close all menus
  const closeAllMenus = React.useCallback(() => {
    setOpenMenuId(null);
  }, []);

  // Helper to open a specific menu
  const openMenu = React.useCallback((menuId: string) => {
    // If clicking the same menu that's already open, close it (toggle)
    if (openMenuId === menuId) {
      setOpenMenuId(null);
      return;
    }
    
    // If another menu is open, close it first, then open the new one
    if (openMenuId !== null) {
      setOpenMenuId(null);
      menuKeyRef.current += 1;
      // Small delay to ensure the close completes
      setTimeout(() => {
        setOpenMenuId(menuId);
      }, 50);
    } else {
      // No menu is open, just open the new one
      menuKeyRef.current += 1;
      setOpenMenuId(menuId);
    }
  }, [openMenuId]);

  // Derived states for each menu
  const dayPickerVisible = openMenuId === 'day';
  const startTimePickerVisible = openMenuId === 'startTime';
  const endTimePickerVisible = openMenuId === 'endTime';
  const menuVisible = openMenuId === 'menu';

  React.useEffect(() => {
    setEditedSubject({
      title: title,
      schedules: schedules || [],
      color: color,
    });
  }, [title, schedules, color, id]);

  const handleAddSchedule = () => {
    if (currentSchedule.day && currentSchedule.startTime && currentSchedule.endTime) {
      setEditedSubject({
        ...editedSubject,
        schedules: [...editedSubject.schedules, currentSchedule],
      });
      setCurrentSchedule({ day: '', startTime: '', endTime: '' });
    }
  };

  const handleRemoveSchedule = (index: number) => {
    setEditedSubject({
      ...editedSubject,
      schedules: editedSubject.schedules.filter((_, i) => i !== index),
    });
  };

  const handleSaveEdit = () => {
    if (editedSubject.title && editedSubject.schedules.length > 0 && onUpdate) {
      onUpdate(id, editedSubject);
      setEditModalVisible(false);
    }
  };

  const handleDelete = () => {
    closeAllMenus();
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
    setDeleteModalVisible(false);
  };

  const handleOpenEdit = () => {
    closeAllMenus();
    setEditModalVisible(true);
  };

  // Handle both hex colors and class names (for backward compatibility)
  const getColorValue = (colorValue: string): string => {
    const colorMap: { [key: string]: string } = {
      'bg-blue-600': '#2563EB',
      'bg-green-600': '#16A34A',
      'bg-pink-500': '#EC4899',
      'bg-yellow-600': '#CA8A04',
      'bg-purple-600': '#9333EA',
      'bg-orange-600': '#EA580C',
      'bg-yellow-400': '#FACC15',
      'bg-cyan-500': '#06B6D4',
    };
    return colorMap[colorValue] || colorValue;
  };

  const displayColor = getColorValue(color);

  return (
    <>
      <CardContainer color={displayColor}>
        <CardHeader>
          <Text variant="titleMedium" style={{ color: '#fff', fontWeight: 'bold', flex: 1, marginRight: 8 }}>
            {title}
          </Text>
          <Menu
            key={`menu-${menuKeyRef.current}`}
            visible={menuVisible}
            onDismiss={closeAllMenus}
            anchor={
              <IconButton
                icon="dots-vertical"
                iconColor="#fff"
                size={20}
                onPress={() => openMenu('menu')}
              />
            }
          >
            <Menu.Item onPress={handleOpenEdit} title="Editar" leadingIcon="pencil" />
            <Menu.Item onPress={handleDelete} title="Eliminar" leadingIcon="delete" titleStyle={{ color: '#DC2626' }} />
          </Menu>
        </CardHeader>
        <View>
          {schedules.slice(0, 3).map((schedule, index) => (
            <ScheduleItem key={index}>
              <Text variant="bodySmall" style={{ color: '#fff', opacity: 0.9 }}>
                {schedule.day}
              </Text>
              <Text variant="bodySmall" style={{ color: '#fff', opacity: 0.9 }}>
                {schedule.startTime} - {schedule.endTime}
              </Text>
            </ScheduleItem>
          ))}
        </View>
      </CardContainer>

      {/* Edit Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: '#fff',
            padding: 24,
            margin: 20,
            borderRadius: 16,
            maxHeight: '90%',
          }}
        >
          <ScrollView>
            <Text variant="titleLarge" style={{ color: '#2563EB', marginBottom: 16 }}>
              Nombre de la materia:
            </Text>
            
            <TextInput
              label="Nombre"
              value={editedSubject.title}
              onChangeText={(text) => setEditedSubject({ ...editedSubject, title: text })}
              mode="outlined"
              style={{ marginBottom: 16, backgroundColor: '#F3F4F6' }}
            />

            <Text variant="titleMedium" style={{ color: '#2563EB', marginBottom: 12 }}>
              Clases:
            </Text>

            {editedSubject.schedules.map((schedule, index) => (
              <ScheduleChip key={index}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ color: '#fff', marginBottom: 4 }}>
                    {schedule.day}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#fff', opacity: 0.9 }}>
                    {schedule.startTime} a {schedule.endTime}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveSchedule(index)} style={{ padding: 4 }}>
                  <Icon source="close" size={20} color="#fff" />
                </TouchableOpacity>
              </ScheduleChip>
            ))}

            <Menu
              key={`day-${menuKeyRef.current}`}
              visible={dayPickerVisible}
              onDismiss={closeAllMenus}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => openMenu('day')}
                  style={{ marginBottom: 8 }}
                >
                  {currentSchedule.day || 'Selecciona un día'}
                </Button>
              }
            >
              {DAYS_OF_WEEK.map((day) => (
                <Menu.Item
                  key={day}
                  onPress={() => {
                    setCurrentSchedule({ ...currentSchedule, day });
                    closeAllMenus();
                  }}
                  title={day}
                />
              ))}
            </Menu>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Menu
                key={`startTime-${menuKeyRef.current}`}
                visible={startTimePickerVisible}
                onDismiss={closeAllMenus}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => openMenu('startTime')}
                    style={{ flex: 1 }}
                  >
                    {currentSchedule.startTime ? formatTime(currentSchedule.startTime) : 'Inicio'}
                  </Button>
                }
              >
                {TIME_SLOTS.map((time) => (
                  <Menu.Item
                    key={time}
                    onPress={() => {
                      setCurrentSchedule({ ...currentSchedule, startTime: time });
                      closeAllMenus();
                    }}
                    title={formatTime(time)}
                  />
                ))}
              </Menu>

              <Text>a</Text>

              <Menu
                key={`endTime-${menuKeyRef.current}`}
                visible={endTimePickerVisible}
                onDismiss={closeAllMenus}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => openMenu('endTime')}
                    style={{ flex: 1 }}
                    disabled={!currentSchedule.startTime}
                  >
                    {currentSchedule.endTime ? formatTime(currentSchedule.endTime) : 'Fin'}
                  </Button>
                }
              >
                {TIME_SLOTS.filter(time => {
                  if (!currentSchedule.startTime) return true;
                  return time > currentSchedule.startTime;
                }).map((time) => (
                  <Menu.Item
                    key={time}
                    onPress={() => {
                      setCurrentSchedule({ ...currentSchedule, endTime: time });
                      closeAllMenus();
                    }}
                    title={formatTime(time)}
                  />
                ))}
              </Menu>
            </View>

            <Button
              mode="contained"
              onPress={handleAddSchedule}
              disabled={!currentSchedule.day || !currentSchedule.startTime || !currentSchedule.endTime}
              style={{ marginBottom: 16, backgroundColor: '#2563EB' }}
            >
              Añadir +
            </Button>

            <Text variant="titleMedium" style={{ color: '#2563EB', marginBottom: 12 }}>
              Color de la materia:
            </Text>

            <ColorGrid>
              {COLOR_OPTIONS.map((colorOption) => {
                const currentColorValue = getColorValue(editedSubject.color);
                const isSelected = currentColorValue === colorOption.value;
                return (
                  <ColorButton
                    key={colorOption.value}
                    color={colorOption.value}
                    selected={isSelected}
                    onPress={() => setEditedSubject({ ...editedSubject, color: colorOption.value })}
                  >
                    {isSelected && <Text style={{ color: '#fff', fontSize: 24 }}>✓</Text>}
                  </ColorButton>
                );
              })}
            </ColorGrid>

            <Button
              mode="contained"
              onPress={handleSaveEdit}
              disabled={!editedSubject.title || editedSubject.schedules.length === 0}
              style={{ marginTop: 16, backgroundColor: '#06B6D4' }}
            >
              Guardar cambios
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Delete Confirmation Modal */}
      <Portal>
        <Modal
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: '#fff',
            padding: 24,
            margin: 20,
            borderRadius: 16,
          }}
        >
          <Text variant="titleLarge" style={{ marginBottom: 8 }}>
            ¿Estás seguro?
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 24, color: '#6B7280' }}>
            Esta acción no se puede deshacer. Se eliminará permanentemente la materia "{title}" y todos sus horarios.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              mode="outlined"
              onPress={() => setDeleteModalVisible(false)}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={confirmDelete}
              style={{ flex: 1, backgroundColor: '#DC2626' }}
            >
              Eliminar
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}
