import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';
import { UserModel } from '../models/user.model';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  phone = '';
  address = '';
  errorMessage = '';

  register(): void {
    this.errorMessage = '';

    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.password.trim() ||
      !this.phone.trim() ||
      !this.address.trim()
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    const newUser: UserModel = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password,
      phone: this.phone.trim(),
      address: this.address.trim(),
      favoriteToyTypes: [],
      reservations: [],
    };

    const success = this.authService.register(newUser);

    if (!success) {
      this.errorMessage = 'An account with this email already exists.';
      return;
    }

    this.router.navigate(['/login']);
  }
}
