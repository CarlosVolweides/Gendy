import { BSON } from 'realm';
import { openRealm } from '../database/realm';
type ObjectId = BSON.ObjectId;

export class ClasesRepository {
    private realm = openRealm()

    hasClase(): boolean {
        return this.realm.objects('Clase').length > 0
    }

    createClase(dia: string, horaEntrada: Date, horaSalida: Date, materiaId: ObjectId): { success: boolean; claseId?: ObjectId; error?: string } {
        try{
            let claseId = new BSON.ObjectId()
            this.realm.write(() => {
                this.realm.create('Clase', {
                    _id: claseId,
                    dia,
                    horaEntrada,
                    horaSalida,
                    materia: materiaId,
                })
            })
            return { success: true, claseId }
        } catch (error: any) {
            console.error('Error al crear clase:', error);
            return { success: false, error: error.message };
        }
    }

    updateClase(id: ObjectId, dia: string, horaEntrada: Date, horaSalida: Date): { success: boolean; error?: string } {
        try{
            const clase = this.realm.objectForPrimaryKey('Clase', id)
            if (!clase) return { success: false, error: 'Clase no encontrada' }
            this.realm.write(() => {
                clase.dia = dia
                clase.horaEntrada = horaEntrada
                clase.horaSalida = horaSalida
            })
            return { success: true }
        } catch (error: any) {
            console.error('Error al actualizar clase:', error);
            return { success: false, error: error.message };
        }
    }

    deleteClase(id: ObjectId): { success: boolean; error?: string } {
        try{
            const clase = this.realm.objectForPrimaryKey('Clase', id)
            if (!clase) return { success: false, error: 'Clase no encontrada' }
            this.realm.write(() => {
                this.realm.delete(clase)
            })
            return { success: true }
        } catch (error: any) {
            console.error('Error al eliminar clase:', error);
            return { success: false, error: error.message };
        }
    }
}