import { BSON } from 'realm';
import { openRealm } from '../database/realm';
type ObjectId = BSON.ObjectId;
import { HorarioType } from '../types/types';

export class HorarioRepository {
    private realm = openRealm()

    hasHorario(): boolean {
        return this.realm.objects('Horario').length > 0
    }

    createHorario(nombre: string): { success: boolean; error?: string } {
        try {
            this.realm.write(() => {
                this.realm.create('Horario', {
                    _id: new BSON.ObjectId(),
                    nombre,
                });
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error al crear horario:', error);
            return { success: false, error: error.message };
        }
    }

    getHorarios(): { success: boolean; horariosData?: HorarioType[]; error?: string } {
        try {
          const horarios = this.realm.objects('Horario');
          const horariosData = Array.from(horarios).map((horario) => ({
            _id: horario._id as ObjectId,
            nombre: horario.nombre,
          })) as HorarioType[];
      
          return { success: true, horariosData };
        } catch (error: any) {
          console.error('Error al obtener horarios:', error);
          return { success: false, error: error.message };
        }
      }
      

    updateHorario(idHorario: ObjectId, newName: string): { success: boolean; error?: string } {
        if (!this.hasHorario) {
            return { success: false, error: 'No hay horarios para actualizar' }
        }
        try{
            const Horario = this.realm.objectForPrimaryKey('Horario', idHorario)
            if (!Horario) {
                return { success: false, error: 'Horario no encontrado' }
            }
            this.realm.write(() => {
                Horario.nombre = newName
            })
            return { success: true }
        } catch (error: any) {
            console.log('Error actualizando horario:', error)
            return { success: false, error: error.message }
        }
    }

    deleteHorario(idHorario: ObjectId): { success: boolean; error?: string } {
        if (!this.hasHorario) {
            return { success: false, error: 'No hay horarios para eliminar' }
        }
        try{
            const Horario = this.realm.objectForPrimaryKey('Horario', idHorario)
            if (!Horario) {
                return { success: false, error: 'Horario no encontrado' }
            }
            this.realm.write(() => {
                this.realm.delete(Horario.materias)
                this.realm.delete(Horario)
            })
            return { success: true }
        } catch (error: any) {
            console.log('Error eliminando horario:', error)
            return { success: false, error: error.message }
        }
    }
}