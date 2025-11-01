import { makeAutoObservable } from 'mobx';
import { UserRepository } from '../repository/userRepository';

export class UserViewModel {
  private repo: UserRepository;
  userName: string | null = null;
  loading: boolean = false;
  error: string | null = null;
  updating: boolean = false;
  hasUser: boolean = false;

  constructor(repo?: UserRepository) {
    this.repo = repo ?? new UserRepository();
    makeAutoObservable(this);
  }

  setUpdating(value: boolean) {
    this.updating = value;
  }

  get isUpdating() {
    return this.updating;
  }

  loadUser() {
    try {
      this.loading = true;
      const result = this.repo.getUser();
      if (result.success && result.user) {
        this.userName = result.user;
        this.hasUser = true;
        this.error = null;
      } else {
        this.userName = null;
        this.hasUser = false;
        this.error = result.error ?? null;
      }
    } finally {
      this.loading = false;
    }
  }

  createUser(name: string) {
    const result = this.repo.createUser(name);
    if (result.success) {
      this.userName = name;
      this.hasUser = true;
      this.error = null;
    } else {
      this.error = result.error ?? 'Error desconocido al crear usuario';
    }
  }

  updateUserName(newName: string) {
    const result = this.repo.updateUserName(newName);
    if (result.success) {
      this.userName = newName;
      this.error = null;
      this.updating = false;
    } else {
      this.error = result.error ?? 'Error al actualizar nombre';
    }
  }

  deleteUser() {
    const result = this.repo.deleteUser();
    if (result.success) {
      this.userName = null;
      this.hasUser = false;
      this.error = null;
    } else {
      this.error = result.error ?? 'Error al borrar usuario';
    }
  }
}
