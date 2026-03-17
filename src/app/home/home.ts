import { Component, inject, signal } from '@angular/core';
import { ToyService } from '../services/toy.service';
import { ToyModel } from '../models/toy.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, RouterLink, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private toyService = inject(ToyService);

  toys = signal<ToyModel[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  constructor() {
    this.loadToys();
  }

  async loadToys() {
    try {
      const resp = await this.toyService.getToys();
      this.toys.set(resp.data);
    } catch (error) {
      this.errorMessage.set('Failed to load toys!');
    } finally {
      this.isLoading.set(false);
    }
  }

  getImageUrl(imageUrl: string): string {
    return `https://toy.pequla.com${imageUrl}`;
  }
}
