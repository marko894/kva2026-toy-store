import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ToyModel } from '../models/toy.model';
import { ToyService } from '../services/toy.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { Alerts } from '../utils/alerts';

@Component({
  selector: 'app-toy-details',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
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

  toy = signal<ToyModel | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  quantity = 1;

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

  increaseQuantity(): void {
    this.quantity += 1;
  }

  decreaseQuantity(): void {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  reserveToy(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const currentToy = this.toy();
    if (!currentToy) return;

    const success = this.cartService.addToyToReservations(currentToy, this.quantity);

    if (success) {
      Alerts.success(
        `Uspesno je ${this.quantity > 1 ? 'rezervisano' : 'rezervisan'} ${this.quantity} ${this.quantity > 1 ? 'artikla' : 'artikal'}.`,
      );
      this.quantity = 1;
    }
  }

  getAverageRating(toyId: number): string {
    const rating = this.cartService.getAverageRatingForToy(toyId);
    return rating === null ? 'Nema ocena' : `${rating}/5`;
  }
}
