import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface matching the structure of your JSON file
export interface MasterAgriItem {
  username: string; // The field to filter by
  itemName: string;
  category: string;
  quantity: number;
  price: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgriService {
  // YOUR ONE JSON LINK
  private jsonUrl = 'assets/master-data.json'; 

  constructor(private http: HttpClient) { }

  getMasterData(): Observable<MasterAgriItem[]> {
    return this.http.get<MasterAgriItem[]>(this.jsonUrl);
  }
}