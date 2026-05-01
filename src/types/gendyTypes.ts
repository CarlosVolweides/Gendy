export interface GendyMetadata {
  version: string;
  app: string;
  exportDate: string;
  format: string;
}

export interface GendyClase {
  dia: string;
  horaEntrada: string;
  horaSalida: string;
}

export interface GendyMateria {
  nombre: string;
  colorHex: string;
  clases: GendyClase[];
}

export interface GendyScheduleData {
  nombre: string;
  materias: GendyMateria[];
}

export interface GendyFile {
  metadata: GendyMetadata;
  schedule: GendyScheduleData;
}
