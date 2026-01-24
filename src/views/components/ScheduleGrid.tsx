import React from 'react';
import styled from 'styled-components/native';
import { Text } from 'react-native-paper';
import { ScrollView } from 'react-native';

interface ScheduleBlock {
  day: number;
  hour: number;
  color: string;
  duration: number;
  subjectName: string;
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

interface ScheduleGridProps {
  subjects: Subject[];
}

const DAY_MAP: { [key: string]: number } = {
  'Lunes': 0,
  'Martes': 1,
  'Miércoles': 2,
  'Jueves': 3,
  'Viernes': 4,
};

function timeToHourIndex(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const baseHour = 8; // 8:00 am
  const totalMinutes = (hours - baseHour) * 60 + minutes;
  return Math.floor(totalMinutes / 45); // Cada slot es de 45 minutos
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  return Math.ceil(totalMinutes / 45); // Redondear hacia arriba para cubrir el tiempo completo
}

const Container = styled(ScrollView)`
  width: 100%;
  padding-bottom: 8px;
`;

const ContentWrapper = styled.View`
  min-width: 100%;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  margin-bottom: 8px;
`;

const TimeColumn = styled.View`
  width: 64px;
  flex-shrink: 0;
`;

const DayHeader = styled.View`
  width: 80px;
  flex-shrink: 0;
  align-items: center;
  margin-horizontal: 4px;
`;

const DayHeaderText = styled(Text)`
  font-size: 12px;
  color: ${({ theme }: { theme: any }) => theme?.colors?.onSurface || theme?.colors?.text || '#71717a'};
  opacity: 0.6;
`;

const GridContainer = styled.View`
  position: relative;
`;

const HourRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 2px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }: { theme: any }) => theme?.colors?.surface || '#e4e4e7'};
  padding-bottom: 2px;
`;

const TimeLabel = styled(Text)`
  width: 64px;
  flex-shrink: 0;
  font-size: 12px;
  color: ${({ theme }: { theme: any }) => theme?.colors?.onSurface || theme?.colors?.text || '#71717a'};
  opacity: 0.6;
  text-align: right;
  padding-right: 8px;
`;

const DaysRow = styled.View`
  flex: 1;
  flex-direction: row;
  position: relative;
`;

const DayCell = styled.View`
  width: 80px;
  height: 32px;
  margin-horizontal: 4px;
  flex-shrink: 0;
  position: relative;
`;

const ScheduleBlock = styled.View<{ color: string; duration: number }>`
  background-color: ${({ color }) => color};
  border-radius: 12px;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  height: ${({ duration }) => duration * 34}px;
`;

const SubjectText = styled(Text)`
  color: #ffffff;
  font-size: 10px;
  line-height: 12px;
  text-align: center;
  font-weight: 500;
`;

export function ScheduleGrid({ subjects }: ScheduleGridProps) {
  // Convertir las materias a bloques del grid
  const scheduleBlocks: ScheduleBlock[] = subjects.flatMap(subject =>
    subject.schedules.map(schedule => ({
      day: DAY_MAP[schedule.day] ?? -1,
      hour: timeToHourIndex(schedule.startTime),
      color: subject.color,
      duration: calculateDuration(schedule.startTime, schedule.endTime),
      subjectName: subject.title,
    }))
  ).filter(block => block.day !== -1); // Filtrar días no válidos

  // Función para truncar por palabras
  const truncateWords = (text: string, maxWords: number = 3) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return words;
    return [...words.slice(0, maxWords), '...'];
  };
  
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  const hours = [
    '8:00 am',
    '8:45 am',
    '9:30 am',
    '10:15 am',
    '11:00 am',
    '11:45 am',
    '12:30 pm',
    '1:15 pm',
    '2:00 pm',
    '2:45 pm',
    '3:30 pm',
    '4:15 pm',
    '5:00 pm'
  ];

  return (
    <Container horizontal showsHorizontalScrollIndicator={false}>
      <ContentWrapper>
        {/* Header con días */}
        <HeaderRow>
          <TimeColumn />
          {days.map((day, index) => (
            <DayHeader key={index}>
              <DayHeaderText>{day}</DayHeaderText>
            </DayHeader>
          ))}
        </HeaderRow>

        {/* Grid de horarios */}
        <GridContainer>
          {hours.map((hour, hourIndex) => (
            <HourRow key={hourIndex}>
              <TimeLabel>{hour}</TimeLabel>
              <DaysRow>
                {days.map((_, dayIndex) => {
                  const block = scheduleBlocks.find(
                    b => b.day === dayIndex && b.hour === hourIndex
                  );
                  
                  // Verificar si este espacio está ocupado por un bloque que empezó antes
                  const isOccupied = scheduleBlocks.some(
                    b => b.day === dayIndex && 
                         b.hour < hourIndex && 
                         b.hour + b.duration > hourIndex
                  );
                  
                  return (
                    <DayCell key={dayIndex}>
                      {block && !isOccupied && (
                        <ScheduleBlock color={block.color} duration={block.duration}>
                          {truncateWords(block.subjectName).map((word, idx) => (
                            <SubjectText key={idx}>{word}</SubjectText>
                          ))}
                        </ScheduleBlock>
                      )}
                    </DayCell>
                  );
                })}
              </DaysRow>
            </HourRow>
          ))}
        </GridContainer>
      </ContentWrapper>
    </Container>
  );
}
