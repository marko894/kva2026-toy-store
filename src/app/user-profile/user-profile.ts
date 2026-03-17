import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../services/auth.service';
import { ToyService } from '../services/toy.service';
import { ToyTypeModel } from '../models/toy.model';
import { UserModel } from '../models/user.model';
import { Alerts } from '../utils/alerts';

@Component({
  selector: 'app-user-profile',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  private authService = inject(AuthService);
  private toyService = inject(ToyService);
  private router = inject(Router);

  user = signal<UserModel | null>(null);
  toyTypes = signal<ToyTypeModel[]>([]);
  isLoading = signal(true);

  firstName = '';
  lastName = '';
  phone = '';
  address = '';
  favoriteToyTypes: string[] = [];

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor() {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    const activeUser = this.authService.getActiveUser();

    if (!activeUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.user.set(activeUser);
    this.firstName = activeUser.firstName;
    this.lastName = activeUser.lastName;
    this.phone = activeUser.phone;
    this.address = activeUser.address;
    this.favoriteToyTypes = [...activeUser.favoriteToyTypes];

    try {
      const response = await this.toyService.getTypes();
      this.toyTypes.set(response.data);
    } catch (error) {
      console.error('Failed to load toy types', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  isFavorite(typeName: string): boolean {
    return this.favoriteToyTypes.includes(typeName);
  }

  toggleFavorite(typeName: string): void {
    if (this.isFavorite(typeName)) {
      this.favoriteToyTypes = this.favoriteToyTypes.filter((type) => type !== typeName);
    } else {
      this.favoriteToyTypes = [...this.favoriteToyTypes, typeName];
    }
  }

  saveProfile(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    const updatedUser: UserModel = {
      ...currentUser,
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      phone: this.phone.trim(),
      address: this.address.trim(),
      favoriteToyTypes: [...this.favoriteToyTypes],
    };

    this.authService.updateActiveUser(updatedUser);
    this.user.set(updatedUser);
    Alerts.success('Profil azuriran uspesno.');
  }

  changePassword(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      Alerts.error('Unesite podatke u sva polja.');
      return;
    }

    if (this.currentPassword !== currentUser.password) {
      Alerts.error('Trenutna lozinka je pogresna.');
      return;
    }

    if (this.newPassword.length < 6) {
      Alerts.error('Nova lozinka mora imati vise od 6 karaktera.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Alerts.error('Morate potvrditi lozinku.');
      return;
    }

    if (this.newPassword === this.currentPassword) {
      Alerts.error('Nova lozinka se mora razlikovati od stare.');
      return;
    }

    this.authService.updateActiveUserPassword(this.newPassword);

    const updatedUser = {
      ...currentUser,
      password: this.newPassword,
    };

    this.user.set(updatedUser);

    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';

    Alerts.success('Password changed successfully.');
  }
}
