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

  addToyToReservations(toy: ToyModel, quantity: number = 1): boolean {
    const user = this.authService.getActiveUser();
    if (!user) return false;

    const safeQuantity = quantity < 1 ? 1 : quantity;

    const newReservation: ReservedToyModel = {
      reservationId: crypto.randomUUID(),
      toy,
      quantity: safeQuantity,
      status: 'rezervisano',
      rating: null,
      reservedAt: new Date().toISOString(),
    };

    user.reservations.push(newReservation);
    this.authService.updateActiveUser({ ...user });
    return true;
  }

  updateQuantity(reservationId: string, change: number): void {
    const user = this.authService.getActiveUser();
    if (!user) return;

    const item = user.reservations.find(
      (reservation) =>
        reservation.reservationId === reservationId && reservation.status === 'rezervisano',
    );

    if (!item) return;

    item.quantity = Math.max(1, item.quantity + change);
    this.authService.updateActiveUser({ ...user });
  }

  removeReservation(reservationId: string): void {
    const user = this.authService.getActiveUser();
    if (!user) return;

    user.reservations = user.reservations.filter((item) => item.reservationId !== reservationId);

    this.authService.updateActiveUser({ ...user });
  }

  updateReservationStatus(reservationId: string, status: ReservationStatus): void {
    const user = this.authService.getActiveUser();
    if (!user) return;

    const item = user.reservations.find(
      (reservation) => reservation.reservationId === reservationId,
    );

    if (!item) return;

    item.status = status;
    this.authService.updateActiveUser({ ...user });
  }

  rateReservation(reservationId: string, rating: number): void {
    const user = this.authService.getActiveUser();
    if (!user) return;

    const item = user.reservations.find(
      (reservation) =>
        reservation.reservationId === reservationId && reservation.status === 'pristiglo',
    );

    if (!item) return;

    item.rating = rating;
    this.authService.updateActiveUser({ ...user });
  }

  getReservedTotalPrice(): number {
    return this.getReservations()
      .filter((item) => item.status === 'rezervisano')
      .reduce((sum, item) => sum + item.toy.price * item.quantity, 0);
  }

  getAverageRatingForToy(toyId: number): number | null {
    const users = this.authService.getUsers();

    const ratings = users
      .flatMap((user) => user.reservations ?? [])
      .filter(
        (item) => item.toy.toyId === toyId && item.status === 'pristiglo' && item.rating !== null,
      )
      .map((item) => item.rating as number);

    if (ratings.length === 0) return null;

    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    return Number(average.toFixed(1));
  }

  getSubtotal(item: ReservedToyModel): number {
    return item.toy.price * item.quantity;
  }
}
