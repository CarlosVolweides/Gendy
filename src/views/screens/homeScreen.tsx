import React from 'react';
import { View, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Text, IconButton } from 'react-native-paper';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { ActivityCard } from '../components/ActivityCard';

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

interface Activity {
  date: string;
  title: string;
  description: string;
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: any }) => theme?.colors?.background || '#fff'};
`;

const Section = styled.View`
  padding: 16px;
`;

const SectionTitle = styled(Text)`
  color: ${({ theme }: { theme: any }) => theme?.colors?.primary || '#60A5FA'};
  font-size: 20px;
  text-align: center;
  margin-bottom: 16px;
`;

const WeekNavigation = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const WeekText = styled(Text)`
  color: ${({ theme }: { theme: any }) => theme?.colors?.onSurface || '#6B7280'};
  font-size: 14px;
  min-width: 120px;
  text-align: center;
`;

const ActivitiesContainer = styled.View``;

export default function HomeScreen() {
  // Mock data - subjects del horario activo
  const [subjects] = React.useState<Subject[]>([
    {
      id: '1',
      title: 'Desarrollo de software II',
      schedules: [
        { day: 'Lunes', startTime: '08:00', endTime: '09:30' },
        { day: 'Miércoles', startTime: '08:00', endTime: '09:30' },
      ],
      color: '#EC4899',
    },
    {
      id: '2',
      title: 'Simulación de sistemas',
      schedules: [
        { day: 'Martes', startTime: '08:00', endTime: '09:30' },
        { day: 'Jueves', startTime: '08:00', endTime: '09:30' },
      ],
      color: '#FACC15',
    },
    {
      id: '3',
      title: 'Inteligencia Artificial',
      schedules: [
        { day: 'Lunes', startTime: '10:15', endTime: '11:45' },
        { day: 'Miércoles', startTime: '10:15', endTime: '11:45' },
      ],
      color: '#06B6D4',
    },
    {
      id: '4',
      title: 'Arquitectura del computador',
      schedules: [
        { day: 'Martes', startTime: '14:00', endTime: '16:15' },
        { day: 'Jueves', startTime: '14:00', endTime: '16:15' },
      ],
      color: '#9333EA',
    },
  ]);

  // Mock activities
  const [activities] = React.useState<Activity[]>([
    {
      date: 'Lunes 13',
      title: 'Examen práctico',
      description: 'Simulación de sistemas',
    },
    {
      date: 'Lunes 13',
      title: 'Entrega de proyecto',
      description: 'Programación web',
    },
    {
      date: 'Martes 14',
      title: 'Reunión de equipo',
      description: 'Proyecto final',
    },
    {
      date: 'Miércoles 15',
      title: 'Presentación',
      description: 'Diseño de interfaces',
    },
  ]);

  // Estado para navegación de semanas
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que la semana empiece el lunes
    return new Date(today.setDate(diff));
  });

  const formatWeekRange = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    const startDay = startDate.getDate();
    const startMonth = monthNames[startDate.getMonth()];
    const endDay = endDate.getDate();
    const endMonth = monthNames[endDate.getMonth()];
    
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  return (
    <Container>
      <ScrollView>
        {/* Schedule Section */}
        <Section>
          <SectionTitle variant="titleLarge">Horario semanal</SectionTitle>
          <ScheduleGrid subjects={subjects} />
        </Section>

        {/* Activities Section */}
        <Section>
          <SectionTitle variant="titleLarge">Actividades de la semana</SectionTitle>
          <WeekNavigation>
            <View style={{ marginRight: 12 }}>
              <IconButton
                icon="chevron-left"
                iconColor="#6B7280"
                size={20}
                onPress={goToPreviousWeek}
              />
            </View>
            <WeekText>{formatWeekRange(currentWeekStart)}</WeekText>
            <View style={{ marginLeft: 12 }}>
              <IconButton
                icon="chevron-right"
                iconColor="#6B7280"
                size={20}
                onPress={goToNextWeek}
              />
            </View>
          </WeekNavigation>
          <ActivitiesContainer>
            {activities.map((activity, index) => (
              <ActivityCard
                key={index}
                date={activity.date}
                title={activity.title}
                description={activity.description}
              />
            ))}
          </ActivitiesContainer>
        </Section>
      </ScrollView>
    </Container>
  );
}
