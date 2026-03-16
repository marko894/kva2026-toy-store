import { Injectable } from '@angular/core';
import axios from 'axios';
import { AgeGroupModel, ToyModel, ToyTypeModel } from '../models/toy.model';

const client = axios.create({
  baseURL: 'https://toy.pequla.com/api',
  headers: {
    Accept: 'application/json',
  },
  validateStatus(status) {
    return status === 200;
  },
});

@Injectable({
  providedIn: 'root',
})
export class ToyService {
  async getToys() {
    return await client.get<ToyModel[]>('/toy');
  }

  async getToyById(id: number) {
    return await client.get<ToyModel>(`/toy/${id}`);
  }

  async getAgeGroups() {
    return await client.get<AgeGroupModel[]>('/age-group');
  }

  async getTypes() {
    return await client.get<ToyTypeModel[]>('/type');
  }
}
