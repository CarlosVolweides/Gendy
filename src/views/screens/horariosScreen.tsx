import React from 'react';
import { View, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Text, Menu, IconButton, Modal, Portal, TextInput, Button } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useViewModelContext } from '../../context/ViewModelContext';
import { SubjectCard } from '../components/SubjectCard';
import { ClaseType } from '../../types/types';

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

const DAYS_OF_WEEK = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
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

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: any }) => theme?.colors?.background || '#fff'};
  padding: 16px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

// Helper functions to convert between UI format and database format
const timeStringToDate = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const dateToTimeString = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const claseToScheduleDay = (clase: ClaseType): ScheduleDay => {
  return {
    day: clase.dia,
    startTime: dateToTimeString(clase.horaEntrada),
    endTime: dateToTimeString(clase.horaSalida),
  };
};

const scheduleDayToClase = (scheduleDay: ScheduleDay): ClaseType => {
  // Import BSON only when needed (inside the function that uses it)
  const { BSON } = require('realm');
  return {
    _id: new BSON.ObjectId(),
    dia: scheduleDay.day,
    horaEntrada: timeStringToDate(scheduleDay.startTime),
    horaSalida: timeStringToDate(scheduleDay.endTime),
  };
};

const HorariosScreen = observer(() => {
  const { horarioViewModel, materiasViewModel, clasesViewModel } = useViewModelContext();
  
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = React.useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = React.useState(false);
  const [newScheduleName, setNewScheduleName] = React.useState('');
  const [newSubject, setNewSubject] = React.useState({
    title: '',
    schedules: [] as ScheduleDay[],
    color: '#16A34A',
  });
  
  const [currentSchedule, setCurrentSchedule] = React.useState({
    day: '',
    startTime: '',
    endTime: '',
  });

  const [menuVisible, setMenuVisible] = React.useState(false);
  const [schedulePickerVisible, setSchedulePickerVisible] = React.useState(false);
  const [dayPickerVisible, setDayPickerVisible] = React.useState(false);
  const [startTimePickerVisible, setStartTimePickerVisible] = React.useState(false);
  const [endTimePickerVisible, setEndTimePickerVisible] = React.useState(false);

  // Load horarios on mount
  React.useEffect(() => {
    horarioViewModel.loadHorarios();
  }, []);

  // Load materias when active horario changes
  React.useEffect(() => {
    if (horarioViewModel.activeHorarioId) {
      materiasViewModel.loadMaterias(horarioViewModel.activeHorarioId.toString());
    }
  }, [horarioViewModel.activeHorarioId]);

  // Convert horarios to UI format
  const schedules: Schedule[] = horarioViewModel.horarios.map(horario => ({
    id: horario._id.toString(),
    name: horario.nombre,
    subjects: [],
  }));

  // Get active schedule
  const activeScheduleId = horarioViewModel.activeHorarioId?.toString() || '';
  const activeSchedule = schedules.find(s => s.id === activeScheduleId);

  // Convert materias to subjects format
  const subjects: Subject[] = materiasViewModel.materias.map(materia => {
    // Safely convert clases to ScheduleDay, handling invalidated Realm objects
    const schedules: ScheduleDay[] = [];
    try {
      // Create a safe copy of the clases array before accessing properties
      const clasesArray = Array.from(materia.clases);
      clasesArray.forEach(clase => {
        try {
          const scheduleDay = claseToScheduleDay(clase);
          schedules.push(scheduleDay);
        } catch (error) {
          // Skip invalidated objects
          console.warn('Error converting clase to ScheduleDay:', error);
        }
      });
    } catch (error) {
      console.warn('Error accessing materia.clases:', error);
    }
    
    return {
      id: materia._id.toString(),
      title: materia.nombre,
      schedules,
      color: materia.colorHex,
    };
  });

  const handleAddSchedule = (name: string) => {
    horarioViewModel.createHorario(name);
    // After creating, the new horario will be loaded and set as active if it's the first one
    // If there are existing horarios, we need to set the newly created one as active
    // The ViewModel will reload horarios, so we need to find the new one and set it as active
    setTimeout(() => {
      const newHorario = horarioViewModel.horarios.find(h => h.nombre === name);
      if (newHorario) {
        horarioViewModel.setActiveHorario(newHorario._id.toString());
      }
    }, 100);
  };

  const handleAddSubject = (subject: Subject) => {
    if (!horarioViewModel.activeHorarioId) return;
    
    // Create materia first
    materiasViewModel.createMateria(
      subject.title,
      subject.color,
      horarioViewModel.activeHorarioId.toString()
    );
    
    // After creating materia, push clases
    // We need to wait for the materia to be created to get its ID
    setTimeout(() => {
      const newMateria = materiasViewModel.materias.find(m => m.nombre === subject.title);
      if (newMateria) {
        const clases: ClaseType[] = subject.schedules.map(scheduleDay => 
          scheduleDayToClase(scheduleDay)
        );
        materiasViewModel.pushClases(newMateria._id.toString(), clases);
      }
    }, 100);
  };

  const handleUpdateSubject = (id: string, updatedSubject: { title: string; schedules: ScheduleDay[]; color: string }) => {
    // Get the materia and extract clase IDs BEFORE updating (to avoid invalidated objects)
    const materia = materiasViewModel.materias.find(m => m._id.toString() === id);
    if (!materia) return;
    
    // Extract clase IDs before any modifications - do this safely
    const existingClaseIds: string[] = [];
    try {
      // Safely extract IDs from Realm objects before they get invalidated
      const clasesArray = Array.from(materia.clases);
      clasesArray.forEach(clase => {
        try {
          existingClaseIds.push(clase._id.toString());
        } catch (e) {
          // Skip invalidated objects
        }
      });
    } catch (e) {
      // If we can't access clases, we'll proceed without deleting
      console.warn('Could not extract clase IDs:', e);
    }
    
    // Update materia
    materiasViewModel.updateMateria(id, updatedSubject.title, updatedSubject.color);
    
    // Delete existing clases using the IDs we extracted before updating
    existingClaseIds.forEach(claseId => {
      clasesViewModel.deleteClase(claseId);
    });
    
    // Then create new clases using pushClases
    setTimeout(() => {
      const newClases: ClaseType[] = updatedSubject.schedules.map(scheduleDay => 
        scheduleDayToClase(scheduleDay)
      );
      materiasViewModel.pushClases(id, newClases);
    }, 200);
  };

  const handleDeleteSubject = (id: string) => {
    materiasViewModel.deleteMateria(id);
  };

  const handleAddScheduleToSubject = () => {
    if (currentSchedule.day && currentSchedule.startTime && currentSchedule.endTime) {
      setNewSubject({
        ...newSubject,
        schedules: [...newSubject.schedules, currentSchedule],
      });
      setCurrentSchedule({ day: '', startTime: '', endTime: '' });
    }
  };

  const handleRemoveSchedule = (index: number) => {
    setNewSubject({
      ...newSubject,
      schedules: newSubject.schedules.filter((_, i) => i !== index),
    });
  };

  const handleAddSubjectSubmit = () => {
    if (newSubject.title && newSubject.schedules.length > 0) {
      const subject: Subject = {
        id: Date.now().toString(),
        title: newSubject.title,
        schedules: newSubject.schedules,
        color: newSubject.color,
      };
      handleAddSubject(subject);
      setNewSubject({ title: '', schedules: [], color: '#16A34A' });
      setCurrentSchedule({ day: '', startTime: '', endTime: '' });
      setIsSubjectDialogOpen(false);
    }
  };

  const handleCreateSchedule = () => {
    if (newScheduleName.trim()) {
      handleAddSchedule(newScheduleName.trim());
      setNewScheduleName('');
      setIsScheduleDialogOpen(false);
    }
  };

  return (
    <Container>
      <ScrollView>
        {/* Selector de horarios */}
        <View style={{ marginBottom: 16 }}>
          <Text variant="bodySmall" style={{ color: '#6B7280', marginBottom: 8 }}>
            Horario activo
          </Text>
          <Menu
            visible={schedulePickerVisible}
            onDismiss={() => setSchedulePickerVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSchedulePickerVisible(true)}
                style={{ backgroundColor: '#fff' }}
              >
                {activeSchedule?.name || 'Seleccionar horario'}
              </Button>
            }
          >
            {schedules.map((schedule) => (
              <Menu.Item
                key={schedule.id}
                onPress={() => {
                  horarioViewModel.setActiveHorario(schedule.id);
                  setSchedulePickerVisible(false);
                }}
                title={schedule.name}
              />
            ))}
          </Menu>
        </View>

        <Header>
          <Text variant="titleLarge" style={{ color: '#60A5FA' }}>
            Materias
          </Text>
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="plus"
                iconColor="#fff"
                size={24}
                onPress={() => setMenuVisible(true)}
                style={{ backgroundColor: '#06B6D4' }}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                setIsScheduleDialogOpen(true);
              }}
              title="Nuevo horario"
              leadingIcon="plus"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                setIsSubjectDialogOpen(true);
              }}
              title="Nueva materia"
              leadingIcon="plus"
            />
          </Menu>
        </Header>

        {/* Dialog para crear nuevo horario */}
        <Portal>
          <Modal
            visible={isScheduleDialogOpen}
            onDismiss={() => {
              setIsScheduleDialogOpen(false);
              setNewScheduleName('');
            }}
            contentContainerStyle={{
              backgroundColor: '#fff',
              padding: 24,
              margin: 20,
              borderRadius: 16,
            }}
          >
            <Text variant="titleLarge" style={{ color: '#2563EB', marginBottom: 8 }}>
              Crear nuevo horario
            </Text>
            <Text variant="bodyMedium" style={{ color: '#6B7280', marginBottom: 16 }}>
              Ingresa un nombre para identificar este horario
            </Text>
            <TextInput
              label="Nombre del horario"
              placeholder="Ej: 6to semestre v1, UGMA, Trabajo..."
              value={newScheduleName}
              onChangeText={setNewScheduleName}
              mode="outlined"
              style={{ marginBottom: 16, backgroundColor: '#F3F4F6' }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                mode="outlined"
                onPress={() => {
                  setIsScheduleDialogOpen(false);
                  setNewScheduleName('');
                }}
                style={{ flex: 1 }}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateSchedule}
                disabled={!newScheduleName.trim()}
                style={{ flex: 1, backgroundColor: '#06B6D4' }}
              >
                Crear horario
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Dialog para agregar materia */}
        <Portal>
          <Modal
            visible={isSubjectDialogOpen}
            onDismiss={() => setIsSubjectDialogOpen(false)}
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
                placeholder="Hint del nombre"
                value={newSubject.title}
                onChangeText={(text) => setNewSubject({ ...newSubject, title: text })}
                mode="outlined"
                style={{ marginBottom: 16, backgroundColor: '#F3F4F6' }}
              />

              <Text variant="titleMedium" style={{ color: '#2563EB', marginBottom: 12 }}>
                Clases:
              </Text>

              {newSubject.schedules.map((schedule, index) => (
                <ScheduleChip key={index}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" style={{ color: '#fff', marginBottom: 4 }}>
                      {schedule.day}
                    </Text>
                    <Text variant="bodySmall" style={{ color: '#fff', opacity: 0.9 }}>
                      {schedule.startTime} a {schedule.endTime}
                    </Text>
                  </View>
                  <IconButton
                    icon="close"
                    iconColor="#fff"
                    size={20}
                    onPress={() => handleRemoveSchedule(index)}
                  />
                </ScheduleChip>
              ))}

              <Menu
                visible={dayPickerVisible}
                onDismiss={() => setDayPickerVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setDayPickerVisible(true)}
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
                      setDayPickerVisible(false);
                    }}
                    title={day}
                  />
                ))}
              </Menu>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Menu
                  visible={startTimePickerVisible}
                  onDismiss={() => setStartTimePickerVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setStartTimePickerVisible(true)}
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
                        setStartTimePickerVisible(false);
                      }}
                      title={formatTime(time)}
                    />
                  ))}
                </Menu>

                <Text>a</Text>

                <Menu
                  visible={endTimePickerVisible}
                  onDismiss={() => setEndTimePickerVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setEndTimePickerVisible(true)}
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
                        setEndTimePickerVisible(false);
                      }}
                      title={formatTime(time)}
                    />
                  ))}
                </Menu>
              </View>

              <Button
                mode="contained"
                onPress={handleAddScheduleToSubject}
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
                  const isSelected = newSubject.color === colorOption.value;
                  return (
                    <ColorButton
                      key={colorOption.value}
                      color={colorOption.value}
                      selected={isSelected}
                      onPress={() => setNewSubject({ ...newSubject, color: colorOption.value })}
                    >
                      {isSelected && <Text style={{ color: '#fff', fontSize: 24 }}>✓</Text>}
                    </ColorButton>
                  );
                })}
              </ColorGrid>

              <Button
                mode="contained"
                onPress={handleAddSubjectSubmit}
                disabled={!newSubject.title || newSubject.schedules.length === 0}
                style={{ marginTop: 16, backgroundColor: '#06B6D4' }}
              >
                Agregar materia
              </Button>
            </ScrollView>
          </Modal>
        </Portal>

        <View style={{ gap: 16 }}>
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              title={subject.title}
              schedules={subject.schedules}
              color={subject.color}
              onUpdate={handleUpdateSubject}
              onDelete={handleDeleteSubject}
            />
          ))}
        </View>
      </ScrollView>
    </Container>
  );
});

export default HorariosScreen;
