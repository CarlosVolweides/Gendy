import { BSON } from 'realm';
import { openRealm } from '../database/realm';

export class UserRepository {
  private realm: Realm = openRealm();

  get hasUser(): boolean {
    const users = this.realm.objects('Usuario');
    return users.length > 0;
  }

  createUser(nombre: string): { success: boolean; error?: string } {
    try {
      this.realm.write(() => {
        this.realm.create('Usuario', {
          _id: new BSON.ObjectId(),
          nombre,
        });
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      return { success: false, error: error.message };
    }
  }

  getUser(): { success: boolean; user?: string; error?: string } {
    try {
      const users = this.realm.objects('Usuario');
      const user = users.length > 0 ? users[0].nombre : undefined;
  
      return { success: true, user: user as string | undefined };
    } catch (error: any) {
      console.error('Error al obtener usuario:', error);
      return { success: false, error: error.message };
    }
  }

  updateUserName(newName: string): { success: boolean; error?: string } {
    try {
      const users = this.realm.objects('Usuario');
      const user = users[0];
  
      if (!user) {
        return { success: false, error: 'No existe un usuario para actualizar.' };
      }
  
      this.realm.write(() => {
        user.nombre = newName;
      });
  
      return { success: true };
    } catch (error: any) {
      console.error('Error al actualizar el nombre del usuario:', error);
      return { success: false, error: error.message };
    }
  }

  deleteUser(): { success: boolean; error?: string } {
    try {
      const users = this.realm.objects('Usuario');
      const user = users[0];
  
      if (!user) {
        return { success: false, error: 'No existe usuario para eliminar.' };
      }
  
      this.realm.write(() => {
        this.realm.delete(user);
      });
  
      return { success: true };
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      return { success: false, error: error.message };
    }
  }
}