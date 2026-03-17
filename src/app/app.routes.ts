import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ToyDetails } from './toy-details/toy-details';
import { Login } from './login/login';
import { Register } from './register/register';
import { UserProfile } from './user-profile/user-profile';
import { Cart } from './cart/cart';
import { Reservations } from './reservations/reservations';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'toy/:id', component: ToyDetails },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: UserProfile },
  { path: 'cart', component: Cart },
  { path: 'reservations', component: Reservations },
];
