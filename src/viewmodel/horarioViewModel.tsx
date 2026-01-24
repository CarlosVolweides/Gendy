import { makeAutoObservable } from 'mobx';
import { BSON } from 'realm';
import { HorarioRepository } from '../repository/horarioRepository';
import { HorarioType } from '../types/types';

type ObjectId = BSON.ObjectId;

export class HorarioViewModel {
  private repo: HorarioRepository;
  horarios: HorarioType[] = [];
  activeHorarioId: ObjectId | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(repo?: HorarioRepository) {
    this.repo = repo ?? new HorarioRepository();
    makeAutoObservable(this);
  }

  loadHorarios() {
    try {
      this.loading = true;
      const result = this.repo.getHorarios();
      if (result.success && result.horariosData) {
        this.horarios = result.horariosData;
        this.error = null;
        // Si no hay horario activo y hay horarios disponibles, establecer el primero como activo
        if (!this.activeHorarioId && this.horarios.length > 0) {
          this.activeHorarioId = this.horarios[0]._id;
        }
      } else {
        this.horarios = [];
        this.error = result.error ?? null;
      }
    } finally {
      this.loading = false;
    }
  }

  createHorario(nombre: string) {
    const result = this.repo.createHorario(nombre);
    if (result.success) {
      this.error = null;
      // Recargar horarios para obtener el nuevo horario con su ID
      this.loadHorarios();
    } else {
      this.error = result.error ?? 'Error desconocido al crear horario';
    }
  }

  updateHorario(id: string, newName: string) {
    const objectId = new BSON.ObjectId(id);
    const result = this.repo.updateHorario(objectId, newName);
    if (result.success) {
      // Actualizar el horario en la lista local
      const horario = this.horarios.find(h => h._id.toString() === id);
      if (horario) {
        horario.nombre = newName;
      }
      this.error = null;
    } else {
      this.error = result.error ?? 'Error al actualizar horario';
    }
  }

  deleteHorario(id: string) {
    const objectId = new BSON.ObjectId(id);
    const result = this.repo.deleteHorario(objectId);
    if (result.success) {
      // Remover el horario de la lista local
      this.horarios = this.horarios.filter(h => h._id.toString() !== id);
      // Si el horario eliminado era el activo, establecer otro como activo o null
      if (this.activeHorarioId?.toString() === id) {
        this.activeHorarioId = this.horarios.length > 0 ? this.horarios[0]._id : null;
      }
      this.error = null;
    } else {
      this.error = result.error ?? 'Error al eliminar horario';
    }
  }

  setActiveHorario(id: string) {
    const objectId = new BSON.ObjectId(id);
    const horario = this.horarios.find(h => h._id.toString() === id);
    if (horario) {
      this.activeHorarioId = objectId;
      this.error = null;
    } else {
      this.error = 'Horario no encontrado';
    }
  }
}
