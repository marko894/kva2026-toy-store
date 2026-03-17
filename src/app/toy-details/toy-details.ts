import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ToyModel } from '../models/toy.model';
import { ToyService } from '../services/toy.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-toy-details',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './toy-details.html',
  styleUrl: './toy-details.scss',
})
export class ToyDetails {
  private route = inject(ActivatedRoute);
  private toyService = inject(ToyService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  toy = signal<ToyModel | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadToy(id);
  }

  async loadToy(id: number) {
    try {
      const response = await this.toyService.getToyById(id);
      this.toy.set(response.data);
    } catch (error) {
      this.errorMessage.set('Failed to load toy details.');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getImageUrl(imageUrl: string): string {
    return `https://toy.pequla.com${imageUrl}`;
  }

  reserveToy(): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Please log in to reserve toys.', 'Close', {
        duration: 2500,
      });
      this.router.navigate(['/login']);
      return;
    }

    const currentToy = this.toy();
    if (!currentToy) return;

    const success = this.cartService.addToyToReservations(currentToy);

    if (success) {
      this.snackBar.open('Toy added to reservation cart.', 'Close', {
        duration: 2500,
      });
    }
  }
}
