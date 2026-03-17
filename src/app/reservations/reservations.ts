import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { ReservedToyModel } from '../models/user.model';
import { Alerts } from '../utils/alerts';

@Component({
  selector: 'app-reservations',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
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

  getSubtotal(item: ReservedToyModel): number {
    return this.cartService.getSubtotal(item);
  }

  increaseQuantity(reservationId: string): void {
    this.cartService.updateQuantity(reservationId, 1);
    this.loadReservations();
  }

  decreaseQuantity(reservationId: string): void {
    this.cartService.updateQuantity(reservationId, -1);
    this.loadReservations();
  }

  markAsArrived(reservationId: string): void {
    this.cartService.updateReservationStatus(reservationId, 'pristiglo');
    this.loadReservations();
    Alerts.success('Rezervacija je oznacena kao pristigla.');
  }

  cancelReservation(reservationId: string): void {
    this.cartService.updateReservationStatus(reservationId, 'otkazano');
    this.loadReservations();
  }

  rateReservation(reservationId: string, rating: number): void {
    this.cartService.rateReservation(reservationId, rating);
    this.loadReservations();
    Alerts.success('Uspesno ste ocenili igracku.');
  }

  removeReservation(reservationId: string): void {
    this.cartService.removeReservation(reservationId);
    this.loadReservations();
  }
}
