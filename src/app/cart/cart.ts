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
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  reservedItems = signal<ReservedToyModel[]>([]);
  totalPrice = signal(0);

  constructor() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadCart();
  }

  loadCart(): void {
    const items = this.cartService
      .getReservations()
      .filter((item) => item.status === 'rezervisano');

    this.reservedItems.set(items);
    this.totalPrice.set(this.cartService.getTotalPrice());
  }

  getImageUrl(imageUrl: string): string {
    return `https://toy.pequla.com${imageUrl}`;
  }

  increaseQuantity(toyId: number): void {
    this.cartService.updateQuantity(toyId, 1);
    this.loadCart();
  }

  decreaseQuantity(toyId: number): void {
    this.cartService.updateQuantity(toyId, -1);
    this.loadCart();
  }

  removeItem(toyId: number): void {
    this.cartService.removeReservedToy(toyId);
    this.loadCart();
  }
}
