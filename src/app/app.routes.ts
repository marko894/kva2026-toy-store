import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ToyDetails } from './toy-details/toy-details';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'toy/:id', component: ToyDetails },
];
