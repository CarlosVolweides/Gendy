import React from 'react';
import styled from 'styled-components/native';
import { Text } from 'react-native-paper';

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

const Container = styled.View`
  width: 100%;
  padding-bottom: 8px;
`;

const ContentWrapper = styled.View`
  width: 100%;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  margin-bottom: 8px;
`;

const TimeColumn = styled.View`
  width: 50px;
  flex-shrink: 0;
`;

const DayHeader = styled.View`
  flex: 1;
  align-items: center;
  margin-horizontal: 2px;
`;

const DayHeaderText = styled(Text)`
  font-size: 11px;
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
  padding-bottom: 2px;
  position: relative;
`;

const HourRowLine = styled.View`
  position: absolute;
  bottom: 0;
  left: 50px;
  right: 0;
  height: 1px;
  background-color: ${({ theme }: { theme: any }) => theme?.colors?.surface || '#e4e4e7'};
  z-index: 1;
`;

const TimeLabel = styled(Text)`
  width: 50px;
  flex-shrink: 0;
  font-size: 11px;
  color: ${({ theme }: { theme: any }) => theme?.colors?.onSurface || theme?.colors?.text || '#71717a'};
  opacity: 0.6;
  text-align: right;
  padding-right: 6px;
`;

const DaysRow = styled.View`
  flex: 1;
  flex-direction: row;
  position: relative;
  z-index: 2;
`;

const DayCell = styled.View`
  flex: 1;
  height: 32px;
  margin-horizontal: 2px;
  position: relative;
  z-index: 2;
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
  z-index: 10;
  elevation: 2;
  overflow: hidden;
`;

const SubjectTextContainer = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  padding-horizontal: 2px;
`;

const SubjectText = styled(Text)`
  color: #ffffff;
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

  // Función para obtener el tamaño de fuente base según la duración
  const getBaseFontSize = (duration: number): number => {
    if (duration === 1) return 9;
    if (duration === 2) return 10;
    return 11;
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
    <Container>
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
              <HourRowLine />
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
                          <SubjectTextContainer>
                            <SubjectText 
                              numberOfLines={Math.max(1, Math.floor(block.duration * 1.5))}
                              adjustsFontSizeToFit={true}
                              minimumFontScale={0.5}
                              style={{ 
                                fontSize: getBaseFontSize(block.duration),
                                lineHeight: getBaseFontSize(block.duration) + 2
                              }}
                            >
                              {block.subjectName}
                            </SubjectText>
                          </SubjectTextContainer>
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
