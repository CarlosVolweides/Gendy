import React from 'react';
import { View, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Text, IconButton } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { ActivityCard } from '../components/ActivityCard';
import { useViewModelContext } from '../../context/ViewModelContext';
import { convertMateriaToSubject, convertActividadToActivity } from '../../utils/typeConverters';

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

const HomeScreen = observer(() => {
  const { materiasViewModel, horarioViewModel, actividadesViewModel } = useViewModelContext();

  // Cargar horarios y materias al montar el componente
  React.useEffect(() => {
    horarioViewModel.loadHorarios();
  }, []);

  React.useEffect(() => {
    if (horarioViewModel.activeHorarioId) {
      materiasViewModel.loadMaterias(horarioViewModel.activeHorarioId.toString());
    }
  }, [horarioViewModel.activeHorarioId]);

  React.useEffect(() => {
    actividadesViewModel.loadActividades();
  }, []);

  // Convertir materias del horario activo a formato Subject
  const subjects: Subject[] = React.useMemo(() => {
    if (!horarioViewModel.activeHorarioId) {
      return [];
    }
    return materiasViewModel.materias
      .filter(materia => materia.horario._id.toString() === horarioViewModel.activeHorarioId?.toString())
      .map(convertMateriaToSubject);
  }, [materiasViewModel.materias, horarioViewModel.activeHorarioId]);

  // Estado para navegación de semanas
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que la semana empiece el lunes
    return new Date(today.setDate(diff));
  });

  // Obtener actividades de la semana actual
  const activities: Activity[] = React.useMemo(() => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(currentWeekStart);
    weekStart.setHours(0, 0, 0, 0);

    const actividadesSemana = actividadesViewModel.getActividadesByDateRange(weekStart, weekEnd);
    return actividadesSemana.map(convertActividadToActivity);
  }, [currentWeekStart, actividadesViewModel.actividades]);

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
});

export default HomeScreen;
