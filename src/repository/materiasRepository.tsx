import { BSON } from 'realm';
import { openRealm } from '../database/realm';
type ObjectId = BSON.ObjectId;
import { MateriaType, ClaseType } from '../types/types';

export class MateriasRepository {
    private realm = openRealm()

    hasMateria(): boolean {
        return this.realm.objects('Materia').length > 0
    }

    createMateria(nombre: string, colorHex: string, horarioId: ObjectId): { success: boolean; materiaId?: ObjectId; error?: string } {
        try{
            let materiaId = new BSON.ObjectId()
            this.realm.write(() => {
                this.realm.create('Materia', {
                    _id: materiaId,
                    nombre,
                    colorHex,
                    horario: horarioId,
                    clases: [],
                })
            })
            return { success: true, materiaId }
        } catch (error: any) {
            console.log('Error creando materia:', error)
            return { success: false, error: error.message }
        }
    }

    pushClases(materiaId: ObjectId, clases: ClaseType[]): { success: boolean; error?: string } {
        try{
            const materia = this.realm.objectForPrimaryKey('Materia', materiaId) as MateriaType | null
            if (!materia) {
                return { success: false, error: 'Materia no encontrada' }
            }
            this.realm.write(() => {
                clases.forEach(clase => {
                    this.realm.create('Clase', {
                        _id: new BSON.ObjectId(),
                        dia: clase.dia,
                        horaEntrada: clase.horaEntrada,
                        horaSalida: clase.horaSalida,
                        materia,
                    })
                    materia.clases.push(clase)
                })
            })
            return { success: true };
        } catch (error: any) {
            console.error('Error al agregar clases a materia:', error);
            return { success: false, error: error.message };
        }
    }

    updateMateria(id: ObjectId, nombre: string, colorHex: string): { success: boolean; error?: string } {
        try {
          const materia = this.realm.objectForPrimaryKey('Materia', id);
          if (!materia) return { success: false, error: 'Materia no encontrada' };
      
          this.realm.write(() => {
            materia.nombre = nombre;
            materia.colorHex = colorHex;
          });
      
          return { success: true };
        } catch (error: any) {
          console.error('Error al actualizar materia:', error);
          return { success: false, error: error.message };
        }
      }

    deleteMateria(id: ObjectId): { success: boolean; error?: string } {
        try {
            const materia = this.realm.objectForPrimaryKey('Materia', id)
            if (!materia) return { success: false, error: 'Materia no encontrada' }
            this.realm.write(() => {
                this.realm.delete(materia.clases)
                this.realm.delete(materia)
            })
            return { success: true };
        } catch (error: any) {
            console.error('Error al eliminar materia:', error);
            return { success: false, error: error.message };
        }
    }
}