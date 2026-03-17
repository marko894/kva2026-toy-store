import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ToyModel } from '../models/toy.model';
import { ToyService } from '../services/toy.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  ],
  templateUrl: './toy-details.html',
  styleUrl: './toy-details.scss',
})
export class ToyDetails {
  private route = inject(ActivatedRoute);
  private toyService = inject(ToyService);

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
}
