import { BSON } from 'realm';
type ObjectId = BSON.ObjectId;

export type HorarioType = {
    _id: ObjectId;
    nombre: string;
}

export type MateriaType = {
    _id: ObjectId;
    nombre: string;
    colorHex: string;
    horario: HorarioType;
    clases: ClaseType[];
}

export type ClaseType = {
    _id: ObjectId;
    dia: string;
    horaEntrada: Date;
    horaSalida: Date;
}