import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { ReservedToyModel } from '../models/user.model';

@Component({
  selector: 'app-reservations',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
})
export class Reservations {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  reservedItems = signal<ReservedToyModel[]>([]);
  arrivedItems = signal<ReservedToyModel[]>([]);
  cancelledItems = signal<ReservedToyModel[]>([]);

  stars = [1, 2, 3, 4, 5];

  constructor() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadReservations();
  }

  loadReservations(): void {
    const reservations = this.cartService.getReservations();

    this.reservedItems.set(reservations.filter((item) => item.status === 'rezervisano'));
    this.arrivedItems.set(reservations.filter((item) => item.status === 'pristiglo'));
    this.cancelledItems.set(reservations.filter((item) => item.status === 'otkazano'));
  }

  getImageUrl(imageUrl: string): string {
    return `https://toy.pequla.com${imageUrl}`;
  }

  markAsArrived(toyId: number): void {
    this.cartService.updateReservationStatus(toyId, 'pristiglo');
    this.loadReservations();
  }

  cancelReservation(toyId: number): void {
    this.cartService.updateReservationStatus(toyId, 'otkazano');
    this.loadReservations();
  }

  rateToy(toyId: number, rating: number): void {
    this.cartService.rateReservedToy(toyId, rating);
    this.loadReservations();
  }

  removeArrivedToy(toyId: number): void {
    this.cartService.removeArrivedToy(toyId);
    this.loadReservations();
  }
}
