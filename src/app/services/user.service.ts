import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

import { API_URL } from '../core/api.config';

const API_BASE = `${API_URL}/users`;

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(API_BASE);
  }

  delete(email: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/${encodeURIComponent(email)}`);
  }
}
