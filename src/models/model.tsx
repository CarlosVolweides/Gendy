import Realm, { BSON } from 'realm';
type ObjectId = BSON.ObjectId;

export class Usuario extends Realm.Object {
  _id!: ObjectId;
  nombre!: string;
  static schema = {
    name: 'Usuario',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      nombre: 'string',
    },
  };
}

export class Horario extends Realm.Object {
  _id!: ObjectId;
  nombre!: string;
  materias!: Realm.List<Materia>;
  static schema = {
    name: 'Horario',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      nombre: 'string',
      materias: { type: 'list', objectType: 'Materia' },
    },
  };
}

export class Materia extends Realm.Object {
  _id!: ObjectId;
  nombre!: string;
  colorHex!: string;
  horario!: Horario;
  clases!: Realm.List<Clase>;
  static schema = {
    name: 'Materia',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      nombre: 'string',
      colorHex: 'string',
      horario: { type: 'object', objectType: 'Horario' },
      clases: { type: 'list', objectType: 'Clase' },
    },
  };
}

export class Clase extends Realm.Object {
  _id!: ObjectId;
  dia!: string;
  horaEntrada!: Date;
  horaSalida!: Date;
  materia!: Materia;
  static schema = {
    name: 'Clase',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      dia: 'string',
      horaEntrada: 'date',
      horaSalida: 'date',
      materia: { type: 'object', objectType: 'Materia' },
    },
  };
}

export class ActividadUni extends Realm.Object {
  _id!: ObjectId;
  titulo!: string;
  descripcion!: string;
  puntaje!: number;
  materia?: Materia;
  clase?: Clase;
  static schema = {
    name: 'ActividadUni',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      titulo: 'string',
      descripcion: 'string',
      puntaje: 'int',
      materia: { type: 'object', objectType: 'Materia', optional: true },
      clase: { type: 'object', objectType: 'Clase', optional: true },
    },
  };
}

export class Actividad extends Realm.Object {
  _id!: ObjectId;
  dia!: Date;
  hora!: Date;
  titulo!: string;
  descripcion!: string;
  static schema = {
    name: 'Actividad',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      dia: 'date',
      hora: 'date',
      titulo: 'string',
      descripcion: 'string',
    },
  };
}