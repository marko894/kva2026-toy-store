import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';

const USERS_KEY = 'users';
const ACTIVE_USER_KEY = 'active_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {
    this.seedDefaultUser();
  }

  private seedDefaultUser(): void {
    const users = this.getUsers();

    if (users.length === 0) {
      const defaultUser: UserModel = {
        firstName: 'Marko',
        lastName: 'User',
        email: 'user@example.com',
        password: 'user123',
        phone: '0601234567',
        address: 'Main Street 1',
        favoriteToyTypes: [],
        reservations: [],
      };

      localStorage.setItem(USERS_KEY, JSON.stringify([defaultUser]));
    }
  }

  getUsers(): UserModel[] {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveUsers(users: UserModel[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const foundUser = users.find((user) => user.email === email && user.password === password);

    if (!foundUser) {
      return false;
    }

    localStorage.setItem(ACTIVE_USER_KEY, foundUser.email);
    return true;
  }

  logout(): void {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }

  register(newUser: UserModel): boolean {
    const users = this.getUsers();
    const exists = users.some((user) => user.email === newUser.email);

    if (exists) {
      return false;
    }

    users.push(newUser);
    this.saveUsers(users);
    return true;
  }

  getActiveUser(): UserModel | null {
    const activeEmail = localStorage.getItem(ACTIVE_USER_KEY);
    if (!activeEmail) {
      return null;
    }

    const users = this.getUsers();
    return users.find((user) => user.email === activeEmail) ?? null;
  }

  isLoggedIn(): boolean {
    return this.getActiveUser() !== null;
  }

  updateActiveUser(updatedUser: UserModel): void {
    const activeEmail = localStorage.getItem(ACTIVE_USER_KEY);
    if (!activeEmail) return;

    const users = this.getUsers().map((user) => (user.email === activeEmail ? updatedUser : user));

    this.saveUsers(users);
    localStorage.setItem(ACTIVE_USER_KEY, updatedUser.email);
  }

  updateActiveUserPassword(newPassword: string): void {
    const activeEmail = localStorage.getItem(ACTIVE_USER_KEY);
    if (!activeEmail) return;

    const users = this.getUsers().map((user) =>
      user.email === activeEmail ? { ...user, password: newPassword } : user,
    );

    this.saveUsers(users);
  }
}
