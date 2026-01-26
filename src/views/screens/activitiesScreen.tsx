import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Text, Modal, Portal, TextInput, Button, RadioButton, IconButton } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { observer } from 'mobx-react-lite';
import { useViewModelContext } from '../../context/ViewModelContext';
import { useTheme } from '../../context/ThemeContext';
import { convertMateriaToSubject } from '../../utils/typeConverters';
import { ActividadType } from '../../repository/actividadesRepository';
import { CustomDropdown } from '../components/CustomDropdown';

interface Activity {
  id: string;
  date: Date;
  title: string;
  description: string;
  time?: string;
  subjectId?: string;
}

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

const DAY_MAP: { [key: string]: number } = {
  'Lunes': 0,
  'Martes': 1,
  'Miércoles': 2,
  'Jueves': 3,
  'Viernes': 4,
  'Sábado': 5,
  'Domingo': 6,
};

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: any }) => theme?.colors?.background || '#fff'};
  padding: 16px;
`;

const CalendarContainer = styled.View<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 24px;
  padding: 8px;
  margin-bottom: 24px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 1;
`;

const ActivityCard = styled.View<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 1;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const EmptyState = styled.View<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 16px;
  padding: 32px;
  align-items: center;
`;

const formatDate = (date: Date): string => {
  const day = DAY_NAMES[date.getDay() === 0 ? 6 : date.getDay() - 1];
  const dayNum = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  return `${day}, ${dayNum} de ${month}`;
};

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Helper function to convert ActividadType to Activity (UI format)
function convertActividadToActivityUI(actividad: ActividadType): Activity {
  // Extract subjectId from descripcion if it was stored there (format: "subjectId:xxx|description")
  let description = actividad.descripcion;
  let subjectId: string | undefined = undefined;
  
  if (description.includes('|subjectId:')) {
    const parts = description.split('|subjectId:');
    description = parts[0];
    subjectId = parts[1];
  }

  // Extract time from hora if available
  const time = actividad.hora ? formatTimeFromDate(actividad.hora) : undefined;

  return {
    id: actividad._id.toString(),
    date: new Date(actividad.dia),
    title: actividad.titulo,
    description,
    time,
    subjectId,
  };
}

// Helper function to format time from Date
function formatTimeFromDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Helper function to convert Activity (UI) to ActividadType format for creation
function prepareActividadForCreation(
  dia: Date,
  hora: Date,
  titulo: string,
  descripcion: string,
  subjectId?: string
): { dia: Date; hora: Date; titulo: string; descripcion: string } {
  // Store subjectId in descripcion if provided
  let finalDescripcion = descripcion;
  if (subjectId) {
    finalDescripcion = `${descripcion}|subjectId:${subjectId}`;
  }
  
  return {
    dia,
    hora,
    titulo,
    descripcion: finalDescripcion,
  };
}

const ActivitiesScreen = observer(() => {
  const { materiasViewModel, horarioViewModel, actividadesViewModel } = useViewModelContext();
  const { theme, themeMode } = useTheme();

  // Cargar horarios y materias al montar el componente
  React.useEffect(() => {
    horarioViewModel.loadHorarios();
    actividadesViewModel.loadActividades();
  }, []);

  React.useEffect(() => {
    if (horarioViewModel.activeHorarioId) {
      materiasViewModel.loadMaterias(horarioViewModel.activeHorarioId.toString());
    }
  }, [horarioViewModel.activeHorarioId]);

  // Convertir materias del horario activo a formato Subject
  const subjects: Subject[] = React.useMemo(() => {
    if (!horarioViewModel.activeHorarioId) {
      return [];
    }
    return materiasViewModel.materias
      .filter(materia => materia.horario._id.toString() === horarioViewModel.activeHorarioId?.toString())
      .map(convertMateriaToSubject);
  }, [materiasViewModel.materias, horarioViewModel.activeHorarioId]);

  const convertedSubjects = subjects.map(subject => ({
    id: subject.id,
    name: subject.title,
    color: subject.color,
    schedule: subject.schedules.map(schedule => ({
      day: DAY_MAP[schedule.day] ?? -1,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    })).filter(s => s.day !== -1),
  }));

  // Convertir actividades de ViewModel a formato Activity (UI)
  const activities: Activity[] = React.useMemo(() => {
    return actividadesViewModel.actividades.map(convertActividadToActivityUI);
  }, [actividadesViewModel.actividades]);

  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [isAddActivityOpen, setIsAddActivityOpen] = React.useState(false);

  const [activityType, setActivityType] = React.useState<'free' | 'subject'>('free');
  const [selectedSubject, setSelectedSubject] = React.useState<string>('');
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
  const [freeActivityDay, setFreeActivityDay] = React.useState<string>('');
  const [freeActivityMonth, setFreeActivityMonth] = React.useState<string>('');
  const [freeActivityYear, setFreeActivityYear] = React.useState<string>('');

  const [newActivity, setNewActivity] = React.useState({
    title: '',
    description: '',
  });

  const [dayPickerVisible, setDayPickerVisible] = React.useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = React.useState(false);
  const [yearPickerVisible, setYearPickerVisible] = React.useState(false);
  const [subjectPickerVisible, setSubjectPickerVisible] = React.useState(false);
  const [subjectDayPickerVisible, setSubjectDayPickerVisible] = React.useState(false);

  const handleAddActivity = () => {
    if (!newActivity.title) return;

    let activityDate: Date;
    let activityTime: Date;
    let subjectId: string | undefined = undefined;

    if (activityType === 'free') {
      if (!freeActivityDay || !freeActivityMonth || !freeActivityYear) return;
      activityDate = new Date(
        parseInt(freeActivityYear),
        parseInt(freeActivityMonth),
        parseInt(freeActivityDay)
      );
      // Set time to start of day for free activities
      activityTime = new Date(activityDate);
      activityTime.setHours(0, 0, 0, 0);
    } else {
      if (!selectedDate || !selectedSubject || selectedDay === null) return;

      const subject = convertedSubjects.find(s => s.id === selectedSubject);
      if (!subject) return;

      const scheduleForDay = subject.schedule.find(s => s.day === selectedDay);
      if (!scheduleForDay) return;

      activityDate = selectedDate;
      // Parse time string (HH:MM) to Date
      const [hours, minutes] = scheduleForDay.startTime.split(':').map(Number);
      activityTime = new Date(activityDate);
      activityTime.setHours(hours, minutes, 0, 0);
      subjectId = selectedSubject;
    }

    const actividadData = prepareActividadForCreation(
      activityDate,
      activityTime,
      newActivity.title,
      newActivity.description,
      subjectId
    );

    actividadesViewModel.createActividad(
      actividadData.dia,
      actividadData.hora,
      actividadData.titulo,
      actividadData.descripcion
    );

    setNewActivity({ title: '', description: '' });
    setActivityType('free');
    setSelectedSubject('');
    setSelectedDay(null);
    setFreeActivityDay('');
    setFreeActivityMonth('');
    setFreeActivityYear('');
    setIsAddActivityOpen(false);
  };

  const handleDeleteActivity = (id: string) => {
    actividadesViewModel.deleteActividad(id);
  };

  const selectedDayActivities = activities.filter(activity => isSameDay(activity.date, selectedDate));

  const markedDates: { [key: string]: { marked: boolean; dotColor: string } } = {};
  activities.forEach(activity => {
    const dateKey = formatDateKey(activity.date);
    if (!markedDates[dateKey]) {
      markedDates[dateKey] = { marked: true, dotColor: '#3b82f6' };
    }
  });

  const selectedDateKey = formatDateKey(selectedDate);
  if (markedDates[selectedDateKey]) {
    markedDates[selectedDateKey] = {
      ...markedDates[selectedDateKey],
      marked: true,
      dotColor: '#3b82f6',
    };
  } else {
    markedDates[selectedDateKey] = { marked: true, dotColor: '#3b82f6' };
  }

  const resetForm = () => {
    setNewActivity({ title: '', description: '' });
    setActivityType('free');
    setSelectedSubject('');
    setSelectedDay(null);
    setFreeActivityDay('');
    setFreeActivityMonth('');
    setFreeActivityYear('');
    setIsAddActivityOpen(false);
  };

  const calendarTheme = {
    backgroundColor: theme.colors.surface,
    calendarBackground: theme.colors.surface,
    textSectionTitleColor: theme.colors.text,
    selectedDayBackgroundColor: theme.colors.primary,
    selectedDayTextColor: '#ffffff',
    todayTextColor: theme.colors.primary,
    dayTextColor: theme.colors.text,
    textDisabledColor: themeMode === 'dark' ? '#4B5563' : '#d9e1e8',
    dotColor: theme.colors.primary,
    selectedDotColor: '#ffffff',
    arrowColor: theme.colors.primary,
    monthTextColor: theme.colors.text,
    textDayFontWeight: '400' as const,
    textMonthFontWeight: 'bold' as const,
    textDayHeaderFontWeight: '600' as const,
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 13,
  };

  return (
    <Container>
      <ScrollView>
        <Text variant="titleLarge" style={{ color: theme.colors.primary, textAlign: 'center', marginBottom: 24 }}>
          Calendario
        </Text>

        <CalendarContainer backgroundColor={theme.colors.surface}>
          <Calendar
            current={formatDateKey(new Date())}
            markedDates={markedDates}
            onDayPress={(day) => {
              const [year, month, date] = day.dateString.split('-').map(Number);
              setSelectedDate(new Date(year, month - 1, date));
            }}
            theme={calendarTheme}
          />
        </CalendarContainer>

        {selectedDate && (
          <View>
            <HeaderRow>
              <Text variant="titleMedium" style={{ color: theme.colors.text }}>
                {formatDate(selectedDate)}
              </Text>
              <IconButton
                icon="plus"
                iconColor="#fff"
                size={20}
                onPress={() => setIsAddActivityOpen(true)}
                style={{ backgroundColor: '#06B6D4' }}
              />
            </HeaderRow>

            {selectedDayActivities.length > 0 ? (
              <View>
                {selectedDayActivities.map((activity) => {
                  const subject = activity.subjectId
                    ? convertedSubjects.find(s => s.id === activity.subjectId)
                    : null;
                  return (
                    <ActivityCard key={activity.id} backgroundColor={theme.colors.surface}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                          <View
                            style={{
                              backgroundColor: subject?.color || '#06B6D4',
                              padding: 8,
                              borderRadius: 8,
                            }}
                          >
                            <IconButton icon="clock-outline" iconColor="#fff" size={16} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={{ color: theme.colors.text }}>
                              {activity.title}
                            </Text>
                            {activity.time && (
                              <Text variant="bodySmall" style={{ color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                                {activity.time}
                              </Text>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteActivity(activity.id)}>
                          <IconButton icon="close" iconColor={themeMode === 'dark' ? '#9CA3AF' : '#9CA3AF'} size={20} />
                        </TouchableOpacity>
                      </View>
                      {activity.description && (
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                          <IconButton icon="file-document-outline" iconColor={themeMode === 'dark' ? '#9CA3AF' : '#9CA3AF'} size={16} />
                          <Text variant="bodyMedium" style={{ color: themeMode === 'dark' ? '#D1D5DB' : '#4B5563', flex: 1 }}>
                            {activity.description}
                          </Text>
                        </View>
                      )}
                    </ActivityCard>
                  );
                })}
              </View>
            ) : (
              <EmptyState backgroundColor={theme.colors.surface}>
                <View
                  style={{
                    backgroundColor: themeMode === 'dark' ? '#374151' : '#E5E7EB',
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <IconButton icon="clock-outline" iconColor={themeMode === 'dark' ? '#9CA3AF' : '#9CA3AF'} size={24} />
                </View>
                <Text variant="bodyMedium" style={{ color: themeMode === 'dark' ? '#9CA3AF' : '#9CA3AF', marginBottom: 16 }}>
                  No hay actividades para este día
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setIsAddActivityOpen(true)}
                  style={{ marginTop: 8 }}
                >
                  Agregar actividad
                </Button>
              </EmptyState>
            )}
          </View>
        )}

        <Portal>
          <Modal
            visible={isAddActivityOpen}
            onDismiss={resetForm}
            contentContainerStyle={{
              backgroundColor: theme.colors.surface,
              padding: 24,
              margin: 20,
              borderRadius: 16,
              maxHeight: '90%',
            }}
          >
            <ScrollView>
              <Text variant="titleLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                Nueva actividad
              </Text>
              <Text variant="bodyMedium" style={{ color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280', marginBottom: 16 }}>
                {activityType === 'free'
                  ? 'Crea una actividad personalizada'
                  : `Agrega una actividad para el ${formatDate(selectedDate)}`}
              </Text>

              <View style={{ marginBottom: 16 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.text, marginBottom: 8 }}>
                  Tipo de actividad
                </Text>
                <RadioButton.Group
                  onValueChange={(value: string) => setActivityType(value as 'free' | 'subject')}
                  value={activityType}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value="free" />
                    <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
                      Actividad libre
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value="subject" />
                    <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
                      Asociada a una materia
                    </Text>
                  </View>
                </RadioButton.Group>
              </View>

              {activityType === 'free' && (
                <View style={{ marginBottom: 16 }}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.text, marginBottom: 8 }}>
                    Fecha
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodySmall" style={{ color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280', marginBottom: 4 }}>
                        Día
                      </Text>
                      <CustomDropdown
                        visible={dayPickerVisible}
                        onDismiss={() => setDayPickerVisible(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setDayPickerVisible(true)}
                            style={{ backgroundColor: themeMode === 'dark' ? '#1E293B' : '#F3F4F6' }}
                          >
                            {freeActivityDay || 'Día'}
                          </Button>
                        }
                        items={Array.from({ length: 31 }, (_, i) => i + 1).map((day) => ({
                          label: day.toString(),
                          value: day.toString(),
                          onPress: () => {
                            setFreeActivityDay(day.toString());
                          },
                        }))}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text variant="bodySmall" style={{ color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280', marginBottom: 4 }}>
                        Mes
                      </Text>
                      <CustomDropdown
                        visible={monthPickerVisible}
                        onDismiss={() => setMonthPickerVisible(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setMonthPickerVisible(true)}
                            style={{ backgroundColor: themeMode === 'dark' ? '#1E293B' : '#F3F4F6' }}
                          >
                            {freeActivityMonth ? MONTH_NAMES[parseInt(freeActivityMonth)] : 'Mes'}
                          </Button>
                        }
                        items={MONTH_NAMES.map((month, index) => ({
                          label: month,
                          value: index.toString(),
                          onPress: () => {
                            setFreeActivityMonth(index.toString());
                          },
                        }))}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text variant="bodySmall" style={{ color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280', marginBottom: 4 }}>
                        Año
                      </Text>
                      <CustomDropdown
                        visible={yearPickerVisible}
                        onDismiss={() => setYearPickerVisible(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setYearPickerVisible(true)}
                            style={{ backgroundColor: themeMode === 'dark' ? '#1E293B' : '#F3F4F6' }}
                          >
                            {freeActivityYear || 'Año'}
                          </Button>
                        }
                        items={Array.from({ length: 5 }, (_, i) => 2025 + i).map((year) => ({
                          label: year.toString(),
                          value: year.toString(),
                          onPress: () => {
                            setFreeActivityYear(year.toString());
                          },
                        }))}
                      />
                    </View>
                  </View>
                </View>
              )}

              {activityType === 'subject' && (
                <>
                  <View style={{ marginBottom: 16 }}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.text, marginBottom: 8 }}>
                      Materia
                    </Text>
                    <CustomDropdown
                      visible={subjectPickerVisible}
                      onDismiss={() => setSubjectPickerVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setSubjectPickerVisible(true)}
                          style={{ backgroundColor: themeMode === 'dark' ? '#1E293B' : '#F3F4F6' }}
                        >
                          {selectedSubject
                            ? convertedSubjects.find(s => s.id === selectedSubject)?.name
                            : 'Selecciona una materia'}
                        </Button>
                      }
                      items={convertedSubjects.map((subject) => ({
                        label: subject.name,
                        value: subject.id,
                        onPress: () => {
                          setSelectedSubject(subject.id);
                          setSelectedDay(null);
                        },
                      }))}
                    />
                  </View>

                  {selectedSubject && (
                    <View style={{ marginBottom: 16 }}>
                      <Text variant="bodyMedium" style={{ color: theme.colors.text, marginBottom: 8 }}>
                        Día de la semana
                      </Text>
                      <CustomDropdown
                        visible={subjectDayPickerVisible}
                        onDismiss={() => setSubjectDayPickerVisible(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setSubjectDayPickerVisible(true)}
                            style={{ backgroundColor: themeMode === 'dark' ? '#1E293B' : '#F3F4F6' }}
                          >
                            {selectedDay !== null
                              ? (() => {
                                  const subject = convertedSubjects.find(s => s.id === selectedSubject);
                                  const schedule = subject?.schedule.find(s => s.day === selectedDay);
                                  return schedule
                                    ? `${DAY_NAMES[selectedDay]} (${schedule.startTime} - ${schedule.endTime})`
                                    : 'Selecciona un día';
                                })()
                              : 'Selecciona un día'}
                          </Button>
                        }
                        items={
                          convertedSubjects
                            .find(s => s.id === selectedSubject)
                            ?.schedule.map((sched) => ({
                              label: `${DAY_NAMES[sched.day]} (${sched.startTime} - ${sched.endTime})`,
                              value: sched.day.toString(),
                              onPress: () => {
                                setSelectedDay(sched.day);
                              },
                            })) || []
                        }
                      />
                    </View>
                  )}
                </>
              )}

              <View style={{ marginBottom: 16 }}>
                <TextInput
                  label="Título"
                  placeholder="Ej: Examen de matemáticas"
                  value={newActivity.title}
                  onChangeText={(text) => setNewActivity({ ...newActivity, title: text })}
                  mode="outlined"
                  style={{ backgroundColor: themeMode === 'dark' ? '#1E293B' : '#F3F4F6' }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <TextInput
                  label="Descripción"
                  placeholder="Ej: Capítulos 1-5"
                  value={newActivity.description}
                  onChangeText={(text) => setNewActivity({ ...newActivity, description: text })}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={{ backgroundColor: themeMode === 'dark' ? '#1E293B' : '#F3F4F6' }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Button
                  mode="outlined"
                  onPress={resetForm}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddActivity}
                  disabled={
                    !newActivity.title ||
                    (activityType === 'free' && (!freeActivityDay || !freeActivityMonth || !freeActivityYear)) ||
                    (activityType === 'subject' && (!selectedSubject || selectedDay === null))
                  }
                  style={{ flex: 1, backgroundColor: '#06B6D4' }}
                >
                  Agregar
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
      </ScrollView>
    </Container>
  );
});

export default ActivitiesScreen;
