import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ToyModel } from '../models/toy.model';
import { ReservedToyModel, ReservationStatus } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private authService = inject(AuthService);

  getReservations(): ReservedToyModel[] {
    const user = this.authService.getActiveUser();
    return user?.reservations ?? [];
  }

  addToyToReservations(toy: ToyModel): boolean {
    const user = this.authService.getActiveUser();
    if (!user) return false;

    const existingItem = user.reservations.find(
      (item) => item.toy.toyId === toy.toyId && item.status === 'rezervisano',
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.reservations.push({
        toy,
        quantity: 1,
        status: 'rezervisano',
        rating: null,
        reservedAt: new Date().toISOString(),
      });
    }

    this.authService.updateActiveUser({ ...user });
    return true;
  }

  updateQuantity(toyId: number, change: number): void {
    const user = this.authService.getActiveUser();
    if (!user) return;

    const item = user.reservations.find(
      (reservation) => reservation.toy.toyId === toyId && reservation.status === 'rezervisano',
    );

    if (!item) return;

    item.quantity = Math.max(1, item.quantity + change);
    this.authService.updateActiveUser({ ...user });
  }

  removeReservedToy(toyId: number): void {
    const user = this.authService.getActiveUser();
    if (!user) return;

    user.reservations = user.reservations.filter(
      (item) => !(item.toy.toyId === toyId && item.status === 'rezervisano'),
    );

    this.authService.updateActiveUser({ ...user });
  }

  removeArrivedToy(toyId: number): void {
    const user = this.authService.getActiveUser();
    if (!user) return;

    user.reservations = user.reservations.filter(
      (item) => !(item.toy.toyId === toyId && item.status === 'pristiglo'),
    );

    this.authService.updateActiveUser({ ...user });
  }

  getTotalPrice(): number {
    return this.getReservations()
      .filter((item) => item.status === 'rezervisano')
      .reduce((sum, item) => sum + item.toy.price * item.quantity, 0);
  }

  updateReservationStatus(toyId: number, status: ReservationStatus): void {
    const user = this.authService.getActiveUser();
    if (!user) return;

    const item = user.reservations.find((reservation) => reservation.toy.toyId === toyId);

    if (!item) return;

    item.status = status;
    this.authService.updateActiveUser({ ...user });
  }

  rateReservedToy(toyId: number, rating: number): void {
    const user = this.authService.getActiveUser();
    if (!user) return;

    const item = user.reservations.find(
      (reservation) => reservation.toy.toyId === toyId && reservation.status === 'pristiglo',
    );

    if (!item) return;

    item.rating = rating;
    this.authService.updateActiveUser({ ...user });
  }
}
