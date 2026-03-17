import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AgeGroupModel, ToyModel, ToyTypeModel } from '../models/toy.model';
import { ToyService } from '../services/toy.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { Alerts } from '../utils/alerts';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private toyService = inject(ToyService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  toys = signal<ToyModel[]>([]);
  toyTypes = signal<ToyTypeModel[]>([]);
  ageGroups = signal<AgeGroupModel[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  quantityMap: Record<number, number> = {};

  searchText = '';
  selectedTypeId: number | null = null;
  selectedAgeGroupId: number | null = null;
  selectedTargetGroup = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  constructor() {
    this.loadData();
  }

  async loadData() {
    try {
      const [toysResponse, typesResponse, ageGroupsResponse] = await Promise.all([
        this.toyService.getToys(),
        this.toyService.getTypes(),
        this.toyService.getAgeGroups(),
      ]);

      this.toys.set(toysResponse.data);
      this.toyTypes.set(typesResponse.data);
      this.ageGroups.set(ageGroupsResponse.data);

      for (const toy of toysResponse.data) {
        this.quantityMap[toy.toyId] = 1;
      }
    } catch (error) {
      this.errorMessage.set('Failed to load toys and filters.');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getImageUrl(imageUrl: string): string {
    return `https://toy.pequla.com${imageUrl}`;
  }

  filteredToys(): ToyModel[] {
    return this.toys().filter((toy) => {
      const search = this.searchText.trim().toLowerCase();

      if (
        search &&
        !toy.name.toLowerCase().includes(search) &&
        !toy.description.toLowerCase().includes(search)
      ) {
        return false;
      }

      if (this.selectedTypeId !== null && toy.type.typeId !== this.selectedTypeId) {
        return false;
      }

      if (this.selectedAgeGroupId !== null && toy.ageGroup.ageGroupId !== this.selectedAgeGroupId) {
        return false;
      }

      if (this.selectedTargetGroup && toy.targetGroup !== this.selectedTargetGroup) {
        return false;
      }

      if (this.minPrice !== null && toy.price < this.minPrice) {
        return false;
      }

      if (this.maxPrice !== null && toy.price > this.maxPrice) {
        return false;
      }

      if (this.dateFrom) {
        const toyDate = new Date(toy.productionDate);
        if (toyDate < this.dateFrom) {
          return false;
        }
      }

      if (this.dateTo) {
        const toyDate = new Date(toy.productionDate);
        if (toyDate > this.dateTo) {
          return false;
        }
      }

      return true;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedTypeId = null;
    this.selectedAgeGroupId = null;
    this.selectedTargetGroup = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.dateFrom = null;
    this.dateTo = null;
  }

  increaseQuantity(toyId: number): void {
    this.quantityMap[toyId] = (this.quantityMap[toyId] || 1) + 1;
  }

  decreaseQuantity(toyId: number): void {
    const current = this.quantityMap[toyId] || 1;
    this.quantityMap[toyId] = Math.max(1, current - 1);
  }

  reserveToy(toy: ToyModel): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const quantity = this.quantityMap[toy.toyId] || 1;

    const success = this.cartService.addToyToReservations(toy, quantity);

    if (success) {
      Alerts.success(
        `Uspesno je ${quantity > 1 ? 'rezervisano' : 'rezervisan'} ${quantity} ${quantity > 1 ? 'artikla' : 'artikal'}.`,
      );
      this.quantityMap[toy.toyId] = 1;
    }
  }

  getAverageRating(toyId: number): string {
    const rating = this.cartService.getAverageRatingForToy(toyId);
    return rating === null ? 'Nema ocena' : `${rating}/5`;
  }

  getRecommendedToys(): ToyModel[] {
    const activeUser = this.authService.getActiveUser();

    if (!activeUser || !activeUser.favoriteToyTypes?.length) {
      return [];
    }

    return this.toys().filter((toy) => activeUser.favoriteToyTypes.includes(toy.type.name));
  }

  hasRecommendations(): boolean {
    return this.getRecommendedToys().length > 0;
  }
}
