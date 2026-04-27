import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Observable } from 'rxjs';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

@Injectable({ providedIn: 'root' })
export class DataService {

  private apiUrl =
    'https://api.data.gov.in/resource/0b827ac7-ebad-47c1-9cc9-816ce4ab10a7?api-key=579b464db66ec23bdd000001868b57d596604c814f69c2e4970ba371&format=json&limit=50';

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      context: new HttpContext().set(SKIP_AUTH, true)
    });
  }
}
