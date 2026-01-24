import { MateriaType, ClaseType, HorarioType } from '../types/types';
import { ActividadType } from '../repository/actividadesRepository';

export interface ScheduleDay {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Subject {
  id: string;
  title: string;
  schedules: ScheduleDay[];
  color: string;
}

export interface Activity {
  date: string;
  title: string;
  description: string;
}

export interface Schedule {
  id: string;
  name: string;
  subjects: Subject[];
}

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');
  return `${hoursStr}:${minutesStr}`;
}

function formatDate(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  return `${dayName} ${day}`;
}

export function convertClaseToScheduleDay(clase: ClaseType): ScheduleDay {
  const startTime = formatTime(clase.horaEntrada);
  const endTime = formatTime(clase.horaSalida);
  return {
    day: clase.dia,
    startTime,
    endTime,
  };
}

export function convertMateriaToSubject(materia: MateriaType): Subject {
  const schedules: ScheduleDay[] = materia.clases.map((clase: ClaseType) => 
    convertClaseToScheduleDay(clase)
  );

  return {
    id: materia._id.toString(),
    title: materia.nombre,
    schedules,
    color: materia.colorHex,
  };
}

export function convertActividadToActivity(actividad: ActividadType): Activity {
  const date = formatDate(new Date(actividad.dia));
  return {
    date,
    title: actividad.titulo,
    description: actividad.descripcion,
  };
}

export function convertHorarioToSchedule(horario: HorarioType, subjects: Subject[] = []): Schedule {
  return {
    id: horario._id.toString(),
    name: horario.nombre,
    subjects,
  };
}
