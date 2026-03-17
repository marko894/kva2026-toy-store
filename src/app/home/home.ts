import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AgeGroupModel, ToyModel, ToyTypeModel } from '../models/toy.model';
import { ToyService } from '../services/toy.service';

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
    MatExpansionModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private toyService = inject(ToyService);

  toys = signal<ToyModel[]>([]);
  toyTypes = signal<ToyTypeModel[]>([]);
  ageGroups = signal<AgeGroupModel[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

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

      console.log('Types:', typesResponse.data);
      console.log('Age groups:', ageGroupsResponse.data);
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
}
