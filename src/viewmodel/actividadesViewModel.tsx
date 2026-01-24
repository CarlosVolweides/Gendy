import { makeAutoObservable } from 'mobx';
import { BSON } from 'realm';
import { ActividadesRepository, ActividadType } from '../repository/actividadesRepository';

type ObjectId = BSON.ObjectId;

export class ActividadesViewModel {
  private repo: ActividadesRepository;
  actividades: ActividadType[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(repo?: ActividadesRepository) {
    this.repo = repo ?? new ActividadesRepository();
    makeAutoObservable(this);
  }

  loadActividades() {
    try {
      this.loading = true;
      const actividades = this.repo.getActividades();
      this.actividades = actividades;
      this.error = null;
    } catch (error: any) {
      this.actividades = [];
      this.error = error.message ?? 'Error al cargar actividades';
    } finally {
      this.loading = false;
    }
  }

  createActividad(dia: Date, hora: Date, titulo: string, descripcion: string) {
    const result = this.repo.createActividad(dia, hora, titulo, descripcion);
    if (result.success) {
      this.error = null;
      // Recargar actividades para obtener la nueva actividad
      this.loadActividades();
    } else {
      this.error = result.error ?? 'Error desconocido al crear actividad';
    }
  }

  updateActividad(id: string, dia: Date, hora: Date, titulo: string, descripcion: string) {
    const objectId = new BSON.ObjectId(id);
    const result = this.repo.updateActividad(objectId, dia, hora, titulo, descripcion);
    if (result.success) {
      // Actualizar la actividad en la lista local
      const actividad = this.actividades.find(a => a._id.toString() === id);
      if (actividad) {
        actividad.dia = dia;
        actividad.hora = hora;
        actividad.titulo = titulo;
        actividad.descripcion = descripcion;
      }
      this.error = null;
    } else {
      this.error = result.error ?? 'Error al actualizar actividad';
    }
  }

  deleteActividad(id: string) {
    const objectId = new BSON.ObjectId(id);
    const result = this.repo.deleteActividad(objectId);
    if (result.success) {
      // Remover la actividad de la lista local
      this.actividades = this.actividades.filter(a => a._id.toString() !== id);
      this.error = null;
    } else {
      this.error = result.error ?? 'Error al eliminar actividad';
    }
  }

  getActividadesByDate(date: Date): ActividadType[] {
    return this.repo.getActividadesByDate(date);
  }

  getActividadesByDateRange(startDate: Date, endDate: Date): ActividadType[] {
    return this.actividades.filter(actividad => {
      const actividadDate = new Date(actividad.dia);
      actividadDate.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return actividadDate >= start && actividadDate <= end;
    });
  }
}
