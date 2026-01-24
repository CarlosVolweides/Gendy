import { makeAutoObservable } from 'mobx';
import { BSON } from 'realm';
import { MateriasRepository } from '../repository/materiasRepository';
import { MateriaType, ClaseType } from '../types/types';

type ObjectId = BSON.ObjectId;

export class MateriasViewModel {
  private repo: MateriasRepository;
  materias: MateriaType[] = [];
  loading: boolean = false;
  error: string | null = null;
  horarioId: ObjectId | null = null;

  constructor(repo?: MateriasRepository) {
    this.repo = repo ?? new MateriasRepository();
    makeAutoObservable(this);
  }

  loadMaterias(horarioId: string) {
    try {
      this.loading = true;
      const objectId = new BSON.ObjectId(horarioId);
      this.horarioId = objectId;
      const materias = this.repo.getMaterias(objectId);
      this.materias = materias;
      this.error = null;
    } catch (error: any) {
      this.materias = [];
      this.error = error.message ?? 'Error al cargar materias';
    } finally {
      this.loading = false;
    }
  }

  createMateria(nombre: string, colorHex: string, horarioId: string) {
    const objectId = new BSON.ObjectId(horarioId);
    const result = this.repo.createMateria(nombre, colorHex, objectId);
    if (result.success) {
      this.error = null;
      // Recargar materias para obtener la nueva materia
      if (this.horarioId?.toString() === horarioId) {
        this.loadMaterias(horarioId);
      }
    } else {
      this.error = result.error ?? 'Error desconocido al crear materia';
    }
  }

  updateMateria(id: string, nombre: string, colorHex: string) {
    const objectId = new BSON.ObjectId(id);
    const result = this.repo.updateMateria(objectId, nombre, colorHex);
    if (result.success) {
      // Actualizar la materia en la lista local
      const materia = this.materias.find(m => m._id.toString() === id);
      if (materia) {
        materia.nombre = nombre;
        materia.colorHex = colorHex;
      }
      this.error = null;
    } else {
      this.error = result.error ?? 'Error al actualizar materia';
    }
  }

  deleteMateria(id: string) {
    const objectId = new BSON.ObjectId(id);
    const result = this.repo.deleteMateria(objectId);
    if (result.success) {
      // Remover la materia de la lista local
      this.materias = this.materias.filter(m => m._id.toString() !== id);
      this.error = null;
    } else {
      this.error = result.error ?? 'Error al eliminar materia';
    }
  }

  pushClases(materiaId: string, clases: ClaseType[]) {
    const objectId = new BSON.ObjectId(materiaId);
    const result = this.repo.pushClases(objectId, clases);
    if (result.success) {
      this.error = null;
      // Recargar materias para obtener las clases actualizadas
      if (this.horarioId) {
        this.loadMaterias(this.horarioId.toString());
      }
    } else {
      this.error = result.error ?? 'Error al agregar clases a la materia';
    }
  }
}
