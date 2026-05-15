import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AddProductForm } from '../../shared/components/add-product-form/add-product';
import { LiveStockService } from '../../services/live-stock.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-sales',
  standalone: true,
  imports: [CommonModule, AddProductForm, RouterLink],
  templateUrl: './my-sales.html',
  styleUrls: ['./my-sales.css']
})
export class MySales implements OnInit {
  private http = inject(HttpClient);
  private liveStock = inject(LiveStockService);

  sales: any[] = [];
  isLoading = true;

  // Signals for state management
  isEditing = signal(false);
  editingItem = signal<any>(null);
  isViewingDetails = signal(false);
  selectedSale = signal<any>(null);

  listings = signal<{ machinery: any[], agriItems: any[] }>({
    machinery: [],
    agriItems: []
  });

  private originalMachinery: any[] = [];
  private originalAgriItems: any[] = [];

  constructor() {
    effect(() => {
      const updates = this.liveStock.stockUpdates();
      const overrides = this.liveStock.productOverrides();

      const updateList = (list: any[], type: string) => {
        return list.map(item => {
          const key = `${type.toLowerCase()}-${item.id}`;
          const override = overrides[key];
          let merged = override ? { ...item, ...override } : item;
          const reduction = updates[key] || 0;
          return { ...merged, quantity: Math.max(0, (merged.quantity || 0) + reduction) };
        });
      };

      this.listings.set({
        machinery: updateList(this.originalMachinery, 'machinery'),
        agriItems: updateList(this.originalAgriItems, 'agriitem')
      });
    });
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;

    // Fetch Sales History (for the table and top sellers)
    this.http.get<any[]>(`${API_URL}/Farmer/sales`).subscribe({
      next: (data) => {
        this.sales = data;
      },
      error: (err) => console.error('Sales fetch error:', err)
    });

    // Fetch Current Listings (for the grid and inventory alerts)
    this.http.get<any>(`${API_URL}/Farmer/listings`).subscribe({
      next: (data) => {
        this.originalMachinery = (data.machinery || []).map((x: any) => ({ ...x, type: 'Machinery' }));
        this.originalAgriItems = (data.agriItems || []).map((x: any) => ({ ...x, type: 'AgriItem' }));
        this.listings.set({
          machinery: [...this.originalMachinery],
          agriItems: [...this.originalAgriItems]
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Listings fetch error:', err);
        this.isLoading = false;
      }
    });
  }

  // Helper method for "Top Sellers" sidebar
  getTopSellers() {
    const counts: any = {};
    this.sales.forEach(s => {
      counts[s.productName] = (counts[s.productName] || 0) + s.quantity;
    });
    return Object.keys(counts).map(name => ({ name, qty: counts[name] }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3);
  }

  // Helper method for "Inventory Alerts" sidebar
  getSoldOutProducts() {
    const all = [
      ...this.listings().machinery,
      ...this.listings().agriItems
    ];
    return all.filter(item => item.quantity === 0);
  }

  getTotalEarnings(): number {
    return this.sales.reduce((acc, s) => acc + (s.price * s.quantity), 0);
  }

  editListing(item: any, type: string): void {
    this.editingItem.set({ ...item, category: type });
    this.isEditing.set(true);
  }

  deleteListing(id: number, type: string): void {
    if (confirm('Are you sure you want to delete this listing?')) {
      const endpoint = type === 'Machinery' ? 'Machinery' : 'AgriItem';
      this.http.delete(`${API_URL}/${endpoint}/${id}`).subscribe({
        next: () => this.fetchData(),
        error: (err) => alert('Delete failed: ' + err.message)
      });
    }
  }

  openSaleDetails(sale: any) {
    this.selectedSale.set(sale);
    this.isViewingDetails.set(true);
  }

  closeSaleDetails() {
    this.isViewingDetails.set(false);
  }

  onSaved() {
    this.isEditing.set(false);
    this.fetchData();
  }

  closeEdit() {
    this.isEditing.set(false);
  }
}
