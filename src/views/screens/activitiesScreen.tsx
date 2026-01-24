import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Text, Modal, Portal, TextInput, Button, RadioButton, Menu, IconButton } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';

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

const CalendarContainer = styled.View`
  background-color: #fff;
  border-radius: 24px;
  padding: 8px;
  margin-bottom: 24px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 1;
`;

const ActivityCard = styled.View`
  background-color: #fff;
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

const EmptyState = styled.View`
  background-color: #F9FAFB;
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

export default function ActivitiesScreen() {
  // Mock subjects - in real app, this would come from Realm or context
  const [subjects] = React.useState<Subject[]>([
    {
      id: '1',
      title: 'Programación Web',
      schedules: [
        { day: 'Lunes', startTime: '08:00', endTime: '09:30' },
        { day: 'Miércoles', startTime: '08:00', endTime: '09:30' },
      ],
      color: '#2563EB',
    },
    {
      id: '2',
      title: 'Diseño de Interfaces',
      schedules: [
        { day: 'Martes', startTime: '10:15', endTime: '11:45' },
      ],
      color: '#9333EA',
    },
  ]);

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

  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [isAddActivityOpen, setIsAddActivityOpen] = React.useState(false);
  const [activities, setActivities] = React.useState<Activity[]>([
    {
      id: '1',
      date: new Date(2025, 9, 13),
      title: 'Examen práctico',
      description: 'Simulación de sistemas',
    },
    {
      id: '2',
      date: new Date(2025, 9, 13),
      title: 'Entrega de proyecto',
      description: 'Programación web',
    },
    {
      id: '3',
      date: new Date(2025, 9, 14),
      title: 'Reunión de equipo',
      description: 'Proyecto final',
    },
    {
      id: '4',
      date: new Date(2025, 9, 15),
      title: 'Presentación',
      description: 'Diseño de interfaces',
    },
  ]);

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
    let activityTime: string | undefined = undefined;

    if (activityType === 'free') {
      if (!freeActivityDay || !freeActivityMonth || !freeActivityYear) return;
      activityDate = new Date(
        parseInt(freeActivityYear),
        parseInt(freeActivityMonth),
        parseInt(freeActivityDay)
      );
    } else {
      if (!selectedDate || !selectedSubject || selectedDay === null) return;

      const subject = convertedSubjects.find(s => s.id === selectedSubject);
      if (!subject) return;

      const scheduleForDay = subject.schedule.find(s => s.day === selectedDay);
      if (!scheduleForDay) return;

      activityDate = selectedDate;
      activityTime = scheduleForDay.startTime;
    }

    const activity: Activity = {
      id: Date.now().toString(),
      date: activityDate,
      title: newActivity.title,
      description: newActivity.description,
      time: activityTime,
      subjectId: activityType === 'subject' ? selectedSubject : undefined,
    };

    setActivities([...activities, activity]);
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
    setActivities(activities.filter(activity => activity.id !== id));
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

  return (
    <Container>
      <ScrollView>
        <Text variant="titleLarge" style={{ color: '#60A5FA', textAlign: 'center', marginBottom: 24 }}>
          Calendario
        </Text>

        <CalendarContainer>
          <Calendar
            current={formatDateKey(new Date())}
            markedDates={markedDates}
            onDayPress={(day) => {
              const [year, month, date] = day.dateString.split('-').map(Number);
              setSelectedDate(new Date(year, month - 1, date));
            }}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#3b82f6',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#3b82f6',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#3b82f6',
              selectedDotColor: '#ffffff',
              arrowColor: '#3b82f6',
              monthTextColor: '#2d4150',
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
          />
        </CalendarContainer>

        {selectedDate && (
          <View>
            <HeaderRow>
              <Text variant="titleMedium" style={{ color: '#374151' }}>
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
                    <ActivityCard key={activity.id}>
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
                            <Text variant="titleMedium" style={{ color: '#1F2937' }}>
                              {activity.title}
                            </Text>
                            {activity.time && (
                              <Text variant="bodySmall" style={{ color: '#6B7280' }}>
                                {activity.time}
                              </Text>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteActivity(activity.id)}>
                          <IconButton icon="close" iconColor="#9CA3AF" size={20} />
                        </TouchableOpacity>
                      </View>
                      {activity.description && (
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                          <IconButton icon="file-document-outline" iconColor="#9CA3AF" size={16} />
                          <Text variant="bodyMedium" style={{ color: '#4B5563', flex: 1 }}>
                            {activity.description}
                          </Text>
                        </View>
                      )}
                    </ActivityCard>
                  );
                })}
              </View>
            ) : (
              <EmptyState>
                <View
                  style={{
                    backgroundColor: '#E5E7EB',
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <IconButton icon="clock-outline" iconColor="#9CA3AF" size={24} />
                </View>
                <Text variant="bodyMedium" style={{ color: '#9CA3AF', marginBottom: 16 }}>
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
              backgroundColor: '#fff',
              padding: 24,
              margin: 20,
              borderRadius: 16,
              maxHeight: '90%',
            }}
          >
            <ScrollView>
              <Text variant="titleLarge" style={{ color: '#2563EB', marginBottom: 8 }}>
                Nueva actividad
              </Text>
              <Text variant="bodyMedium" style={{ color: '#6B7280', marginBottom: 16 }}>
                {activityType === 'free'
                  ? 'Crea una actividad personalizada'
                  : `Agrega una actividad para el ${formatDate(selectedDate)}`}
              </Text>

              <View style={{ marginBottom: 16 }}>
                <Text variant="bodyMedium" style={{ color: '#374151', marginBottom: 8 }}>
                  Tipo de actividad
                </Text>
                <RadioButton.Group
                  onValueChange={(value: string) => setActivityType(value as 'free' | 'subject')}
                  value={activityType}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value="free" />
                    <Text variant="bodyMedium" style={{ color: '#374151' }}>
                      Actividad libre
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value="subject" />
                    <Text variant="bodyMedium" style={{ color: '#374151' }}>
                      Asociada a una materia
                    </Text>
                  </View>
                </RadioButton.Group>
              </View>

              {activityType === 'free' && (
                <View style={{ marginBottom: 16 }}>
                  <Text variant="bodyMedium" style={{ color: '#374151', marginBottom: 8 }}>
                    Fecha
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodySmall" style={{ color: '#6B7280', marginBottom: 4 }}>
                        Día
                      </Text>
                      <Menu
                        visible={dayPickerVisible}
                        onDismiss={() => setDayPickerVisible(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setDayPickerVisible(true)}
                            style={{ backgroundColor: '#F3F4F6' }}
                          >
                            {freeActivityDay || 'Día'}
                          </Button>
                        }
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <Menu.Item
                            key={day}
                            onPress={() => {
                              setFreeActivityDay(day.toString());
                              setDayPickerVisible(false);
                            }}
                            title={day.toString()}
                          />
                        ))}
                      </Menu>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text variant="bodySmall" style={{ color: '#6B7280', marginBottom: 4 }}>
                        Mes
                      </Text>
                      <Menu
                        visible={monthPickerVisible}
                        onDismiss={() => setMonthPickerVisible(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setMonthPickerVisible(true)}
                            style={{ backgroundColor: '#F3F4F6' }}
                          >
                            {freeActivityMonth ? MONTH_NAMES[parseInt(freeActivityMonth)] : 'Mes'}
                          </Button>
                        }
                      >
                        {MONTH_NAMES.map((month, index) => (
                          <Menu.Item
                            key={index}
                            onPress={() => {
                              setFreeActivityMonth(index.toString());
                              setMonthPickerVisible(false);
                            }}
                            title={month}
                          />
                        ))}
                      </Menu>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text variant="bodySmall" style={{ color: '#6B7280', marginBottom: 4 }}>
                        Año
                      </Text>
                      <Menu
                        visible={yearPickerVisible}
                        onDismiss={() => setYearPickerVisible(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setYearPickerVisible(true)}
                            style={{ backgroundColor: '#F3F4F6' }}
                          >
                            {freeActivityYear || 'Año'}
                          </Button>
                        }
                      >
                        {Array.from({ length: 5 }, (_, i) => 2025 + i).map((year) => (
                          <Menu.Item
                            key={year}
                            onPress={() => {
                              setFreeActivityYear(year.toString());
                              setYearPickerVisible(false);
                            }}
                            title={year.toString()}
                          />
                        ))}
                      </Menu>
                    </View>
                  </View>
                </View>
              )}

              {activityType === 'subject' && (
                <>
                  <View style={{ marginBottom: 16 }}>
                    <Text variant="bodyMedium" style={{ color: '#374151', marginBottom: 8 }}>
                      Materia
                    </Text>
                    <Menu
                      visible={subjectPickerVisible}
                      onDismiss={() => setSubjectPickerVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setSubjectPickerVisible(true)}
                          style={{ backgroundColor: '#F3F4F6' }}
                        >
                          {selectedSubject
                            ? convertedSubjects.find(s => s.id === selectedSubject)?.name
                            : 'Selecciona una materia'}
                        </Button>
                      }
                    >
                      {convertedSubjects.map((subject) => (
                        <Menu.Item
                          key={subject.id}
                          onPress={() => {
                            setSelectedSubject(subject.id);
                            setSelectedDay(null);
                            setSubjectPickerVisible(false);
                          }}
                          title={subject.name}
                        />
                      ))}
                    </Menu>
                  </View>

                  {selectedSubject && (
                    <View style={{ marginBottom: 16 }}>
                      <Text variant="bodyMedium" style={{ color: '#374151', marginBottom: 8 }}>
                        Día de la semana
                      </Text>
                      <Menu
                        visible={subjectDayPickerVisible}
                        onDismiss={() => setSubjectDayPickerVisible(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setSubjectDayPickerVisible(true)}
                            style={{ backgroundColor: '#F3F4F6' }}
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
                      >
                        {convertedSubjects
                          .find(s => s.id === selectedSubject)
                          ?.schedule.map((sched) => (
                            <Menu.Item
                              key={sched.day}
                              onPress={() => {
                                setSelectedDay(sched.day);
                                setSubjectDayPickerVisible(false);
                              }}
                              title={`${DAY_NAMES[sched.day]} (${sched.startTime} - ${sched.endTime})`}
                            />
                          ))}
                      </Menu>
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
                  style={{ backgroundColor: '#F3F4F6' }}
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
                  style={{ backgroundColor: '#F3F4F6' }}
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
}
