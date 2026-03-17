import { ToyModel } from './toy.model';

export type ReservationStatus = 'rezervisano' | 'pristiglo' | 'otkazano';

export interface ReservedToyModel {
  reservationId: string;
  toy: ToyModel;
  quantity: number;
  status: ReservationStatus;
  rating: number | null;
  reservedAt: string;
}

export interface UserModel {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  favoriteToyTypes: string[];
  reservations: ReservedToyModel[];
}
