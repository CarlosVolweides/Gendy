import { makeAutoObservable } from 'mobx';
import { BSON } from 'realm';
import { ClasesRepository } from '../repository/clasesRepository';
import { ClaseType } from '../types/types';

type ObjectId = BSON.ObjectId;

export class ClasesViewModel {
  private repo: ClasesRepository;
  clases: ClaseType[] = [];
  loading: boolean = false;
  error: string | null = null;
  materiaId: ObjectId | null = null;

  constructor(repo?: ClasesRepository) {
    this.repo = repo ?? new ClasesRepository();
    makeAutoObservable(this);
  }

  loadClases(materiaId: string) {
    try {
      this.loading = true;
      const objectId = new BSON.ObjectId(materiaId);
      this.materiaId = objectId;
      const clases = this.repo.getClases(objectId);
      this.clases = clases;
      this.error = null;
    } catch (error: any) {
      this.clases = [];
      this.error = error.message ?? 'Error al cargar clases';
    } finally {
      this.loading = false;
    }
  }

  createClase(dia: string, horaEntrada: Date, horaSalida: Date, materiaId: string) {
    const objectId = new BSON.ObjectId(materiaId);
    const result = this.repo.createClase(dia, horaEntrada, horaSalida, objectId);
    if (result.success) {
      this.error = null;
      // Recargar clases para obtener la nueva clase
      if (this.materiaId?.toString() === materiaId) {
        this.loadClases(materiaId);
      }
    } else {
      this.error = result.error ?? 'Error desconocido al crear clase';
    }
  }

  updateClase(id: string, dia: string, horaEntrada: Date, horaSalida: Date) {
    const objectId = new BSON.ObjectId(id);
    const result = this.repo.updateClase(objectId, dia, horaEntrada, horaSalida);
    if (result.success) {
      // Actualizar la clase en la lista local
      const clase = this.clases.find(c => c._id.toString() === id);
      if (clase) {
        clase.dia = dia;
        clase.horaEntrada = horaEntrada;
        clase.horaSalida = horaSalida;
      }
      this.error = null;
    } else {
      this.error = result.error ?? 'Error al actualizar clase';
    }
  }

  deleteClase(id: string) {
    const objectId = new BSON.ObjectId(id);
    const result = this.repo.deleteClase(objectId);
    if (result.success) {
      // Remover la clase de la lista local
      this.clases = this.clases.filter(c => c._id.toString() !== id);
      this.error = null;
    } else {
      this.error = result.error ?? 'Error al eliminar clase';
    }
  }
}
