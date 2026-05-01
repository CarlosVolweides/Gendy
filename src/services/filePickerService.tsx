import * as DocumentPicker from 'expo-document-picker';

export interface PickFileResult {
  success: boolean;
  fileUri?: string;
  fileName?: string;
  error?: string;
}

export class FilePickerService {
  /**
   * Abre el selector de archivos del sistema para seleccionar un archivo .gendy
   */
  async pickGendyFile(): Promise<PickFileResult> {
    try {
      // Verificar que el módulo esté disponible
      if (!DocumentPicker || !DocumentPicker.getDocumentAsync) {
        return { 
          success: false, 
          error: 'El selector de archivos no está disponible. Por favor, reconstruye la aplicación.' 
        };
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { success: false, error: 'Selección de archivo cancelada' };
      }

      if (!result.assets || result.assets.length === 0) {
        return { success: false, error: 'No se seleccionó ningún archivo' };
      }

      const file = result.assets[0];
      
      // Verificar que el archivo tenga extensión .gendy
      if (!file.name || !file.name.toLowerCase().endsWith('.gendy')) {
        return { 
          success: false, 
          error: 'El archivo seleccionado no es un archivo .gendy válido' 
        };
      }

      return {
        success: true,
        fileUri: file.uri,
        fileName: file.name,
      };
    } catch (error: any) {
      console.error('Error al seleccionar archivo:', error);
      
      // Mensaje más específico para errores comunes
      if (error.message && error.message.includes('EventEmitter')) {
        return { 
          success: false, 
          error: 'Error al inicializar el selector de archivos. Por favor, reconstruye la aplicación nativa ejecutando: pnpm android o pnpm ios' 
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Error desconocido al seleccionar archivo' 
      };
    }
  }
}
