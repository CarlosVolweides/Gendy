import Realm from 'realm';
import { Usuario, Horario, Materia, Clase, ActividadUni, Actividad } from '../models/model';

export const realmConfig: Realm.Configuration = {
  schema: [Usuario, Horario, Materia, Clase, ActividadUni, Actividad],
  schemaVersion: 1, // Al hacer cambios en los modelos, incrementa el número de schemaVersion
};

export const openRealm = (): Realm => {
  return new Realm(realmConfig);
};