import { BSON } from 'realm';
import { openRealm } from '../database/realm';
type ObjectId = BSON.ObjectId;

export type ActividadType = {
  _id: ObjectId;
  dia: Date;
  hora: Date;
  titulo: string;
  descripcion: string;
};

export class ActividadesRepository {
  private realm = openRealm();

  hasActividad(): boolean {
    return this.realm.objects('Actividad').length > 0;
  }

  createActividad(
    dia: Date,
    hora: Date,
    titulo: string,
    descripcion: string
  ): { success: boolean; actividadId?: ObjectId; error?: string } {
    try {
      let actividadId = new BSON.ObjectId();
      this.realm.write(() => {
        this.realm.create('Actividad', {
          _id: actividadId,
          dia,
          hora,
          titulo,
          descripcion,
        });
      });
      return { success: true, actividadId };
    } catch (error: any) {
      console.error('Error al crear actividad:', error);
      return { success: false, error: error.message };
    }
  }

  updateActividad(
    id: ObjectId,
    dia: Date,
    hora: Date,
    titulo: string,
    descripcion: string
  ): { success: boolean; error?: string } {
    try {
      const actividad = this.realm.objectForPrimaryKey('Actividad', id);
      if (!actividad) return { success: false, error: 'Actividad no encontrada' };

      this.realm.write(() => {
        actividad.dia = dia;
        actividad.hora = hora;
        actividad.titulo = titulo;
        actividad.descripcion = descripcion;
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error al actualizar actividad:', error);
      return { success: false, error: error.message };
    }
  }

  deleteActividad(id: ObjectId): { success: boolean; error?: string } {
    try {
      const actividad = this.realm.objectForPrimaryKey('Actividad', id);
      if (!actividad) return { success: false, error: 'Actividad no encontrada' };
      this.realm.write(() => {
        this.realm.delete(actividad);
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error al eliminar actividad:', error);
      return { success: false, error: error.message };
    }
  }

  getActividades(): ActividadType[] {
    try {
      const actividades = this.realm.objects('Actividad') as unknown as ActividadType[];
      return Array.from(actividades);
    } catch (error: any) {
      console.error('Error al obtener actividades:', error);
      return [];
    }
  }

  getActividadesByDate(date: Date): ActividadType[] {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const actividades = this.realm
        .objects('Actividad')
        .filtered('dia >= $0 AND dia <= $1', startOfDay, endOfDay) as unknown as ActividadType[];
      return Array.from(actividades);
    } catch (error: any) {
      console.error('Error al obtener actividades por fecha:', error);
      return [];
    }
  }
}
