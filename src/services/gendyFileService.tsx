import { BSON } from 'realm';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { GendyFile, GendyMetadata, GendyScheduleData, GendyMateria, GendyClase } from '../types/gendyTypes';
import { HorarioRepository } from '../repository/horarioRepository';
import { MateriasRepository } from '../repository/materiasRepository';
import { ClasesRepository } from '../repository/clasesRepository';

const GENDY_VERSION = '1.0.0';
const GENDY_APP_NAME = 'Gendy';

export interface ExportResult {
  success: boolean;
  fileUri?: string;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  scheduleName?: string;
  error?: string;
}

export class GendyFileService {
  private horarioRepo = new HorarioRepository();
  private materiasRepo = new MateriasRepository();
  private clasesRepo = new ClasesRepository();

  /**
   * Exporta un horario completo a formato .gendy
   */
  async exportScheduleToGendy(horarioId: string): Promise<ExportResult> {
    try {
      const objectId = new BSON.ObjectId(horarioId);
      
      // Obtener el horario
      const horariosResult = this.horarioRepo.getHorarios();
      if (!horariosResult.success || !horariosResult.horariosData) {
        return { success: false, error: 'No se pudo obtener el horario' };
      }

      const horario = horariosResult.horariosData.find(h => h._id.toString() === horarioId);
      if (!horario) {
        return { success: false, error: 'Horario no encontrado' };
      }

      // Obtener todas las materias del horario
      const materias = this.materiasRepo.getMaterias(objectId);
      
      // Construir datos del horario
      const materiasData: GendyMateria[] = materias.map(materia => {
        const clases = this.clasesRepo.getClases(materia._id);
        const clasesData: GendyClase[] = clases.map(clase => ({
          dia: clase.dia,
          horaEntrada: clase.horaEntrada.toISOString(),
          horaSalida: clase.horaSalida.toISOString(),
        }));

        return {
          nombre: materia.nombre,
          colorHex: materia.colorHex,
          clases: clasesData,
        };
      });

      const scheduleData: GendyScheduleData = {
        nombre: horario.nombre,
        materias: materiasData,
      };

      // Crear metadata
      const metadata: GendyMetadata = {
        version: GENDY_VERSION,
        app: GENDY_APP_NAME,
        exportDate: new Date().toISOString(),
        format: 'gendy',
      };

      // Construir archivo completo
      const gendyFile: GendyFile = {
        metadata,
        schedule: scheduleData,
      };

      // Serializar a JSON
      const jsonString = JSON.stringify(gendyFile, null, 2);

      // Crear nombre del archivo
      const fileName = `${horario.nombre.toLowerCase().replace(/\s+/g, '-')}.gendy`;
      const fileUri = `${await FileSystem.getDocumentDirectoryAsync()}${fileName}`;

      // Escribir el archivo
      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Compartir el archivo
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        return { success: false, error: 'Compartir archivos no está disponible en esta plataforma' };
      }

      return { success: true, fileUri };
    } catch (error: any) {
      console.error('Error al exportar horario:', error);
      return { success: false, error: error.message || 'Error desconocido al exportar' };
    }
  }

  /**
   * Valida que un archivo tenga la estructura correcta de .gendy
   */
  validateGendyFile(data: any): { valid: boolean; error?: string } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'El archivo no es un objeto JSON válido' };
    }

    if (!data.metadata || typeof data.metadata !== 'object') {
      return { valid: false, error: 'El archivo no contiene metadata válida' };
    }

    const metadata = data.metadata;
    if (metadata.format !== 'gendy') {
      return { valid: false, error: 'El archivo no es un archivo .gendy válido' };
    }

    if (metadata.app !== GENDY_APP_NAME) {
      return { valid: false, error: 'El archivo no fue generado por Gendy' };
    }

    if (!data.schedule || typeof data.schedule !== 'object') {
      return { valid: false, error: 'El archivo no contiene datos de horario válidos' };
    }

    if (!data.schedule.nombre || typeof data.schedule.nombre !== 'string') {
      return { valid: false, error: 'El horario no tiene un nombre válido' };
    }

    if (!Array.isArray(data.schedule.materias)) {
      return { valid: false, error: 'Las materias deben ser un array' };
    }

    // Validar estructura de materias
    for (const materia of data.schedule.materias) {
      if (!materia.nombre || typeof materia.nombre !== 'string') {
        return { valid: false, error: 'Una materia no tiene nombre válido' };
      }
      if (!materia.colorHex || typeof materia.colorHex !== 'string') {
        return { valid: false, error: 'Una materia no tiene color válido' };
      }
      if (!Array.isArray(materia.clases)) {
        return { valid: false, error: 'Las clases de una materia deben ser un array' };
      }

      // Validar estructura de clases
      for (const clase of materia.clases) {
        if (!clase.dia || typeof clase.dia !== 'string') {
          return { valid: false, error: 'Una clase no tiene día válido' };
        }
        if (!clase.horaEntrada || typeof clase.horaEntrada !== 'string') {
          return { valid: false, error: 'Una clase no tiene hora de entrada válida' };
        }
        if (!clase.horaSalida || typeof clase.horaSalida !== 'string') {
          return { valid: false, error: 'Una clase no tiene hora de salida válida' };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Importa un archivo .gendy y crea un nuevo horario en la base de datos
   */
  async importGendyFile(fileUri: string): Promise<ImportResult> {
    try {
      // Leer el archivo
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Parsear JSON
      let parsedData: any;
      try {
        parsedData = JSON.parse(fileContent);
      } catch (error) {
        return { success: false, error: 'El archivo no es un JSON válido' };
      }

      // Validar estructura
      const validation = this.validateGendyFile(parsedData);
      if (!validation.valid) {
        return { success: false, error: validation.error || 'Archivo inválido' };
      }

      const gendyFile = parsedData as GendyFile;

      // Crear nuevo horario
      const createResult = this.horarioRepo.createHorario(gendyFile.schedule.nombre);
      if (!createResult.success) {
        return { success: false, error: createResult.error || 'Error al crear el horario' };
      }

      // Obtener el ID del horario recién creado
      const horariosResult = this.horarioRepo.getHorarios();
      if (!horariosResult.success || !horariosResult.horariosData) {
        return { success: false, error: 'Error al obtener el horario creado' };
      }

      const newHorario = horariosResult.horariosData.find(
        h => h.nombre === gendyFile.schedule.nombre
      );
      if (!newHorario) {
        return { success: false, error: 'No se pudo encontrar el horario creado' };
      }

      const horarioId = newHorario._id;

      // Crear materias y clases
      for (const materiaData of gendyFile.schedule.materias) {
        // Crear materia
        const materiaResult = this.materiasRepo.createMateria(
          materiaData.nombre,
          materiaData.colorHex,
          horarioId
        );

        if (!materiaResult.success || !materiaResult.materiaId) {
          console.error('Error al crear materia:', materiaResult.error);
          continue;
        }

        // Convertir clases a formato ClaseType (sin _id, se generará en pushClases)
        const clasesData = materiaData.clases.map(clase => ({
          _id: new BSON.ObjectId(), // Temporal, será reemplazado en pushClases
          dia: clase.dia,
          horaEntrada: new Date(clase.horaEntrada),
          horaSalida: new Date(clase.horaSalida),
        }));

        // Agregar clases a la materia
        if (clasesData.length > 0) {
          const pushResult = this.materiasRepo.pushClases(materiaResult.materiaId, clasesData);
          if (!pushResult.success) {
            console.error('Error al agregar clases a materia:', pushResult.error);
          }
        }
      }

      return { success: true, scheduleName: gendyFile.schedule.nombre };
    } catch (error: any) {
      console.error('Error al importar archivo .gendy:', error);
      return { success: false, error: error.message || 'Error desconocido al importar' };
    }
  }

  /**
   * Extrae metadata de un archivo .gendy
   */
  getGendyMetadata(fileUri: string): Promise<{ success: boolean; metadata?: GendyMetadata; error?: string }> {
    return new Promise(async (resolve) => {
      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const parsedData = JSON.parse(fileContent);
        if (parsedData.metadata) {
          resolve({ success: true, metadata: parsedData.metadata });
        } else {
          resolve({ success: false, error: 'El archivo no contiene metadata' });
        }
      } catch (error: any) {
        resolve({ success: false, error: error.message || 'Error al leer metadata' });
      }
    });
  }
}
