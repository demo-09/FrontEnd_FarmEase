import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AddProductForm } from '../../shared/components/add-product-form/add-product';
import { LiveStockService } from '../../services/live-stock.service';

@Component({
  selector: 'app-my-sales',
  standalone: true,
  imports: [CommonModule, AddProductForm],
  templateUrl: './my-sales.html',
  styleUrls: ['./my-sales.css']
})
export class MySales implements OnInit {
  private http = inject(HttpClient);
  private liveStock = inject(LiveStockService);
  
  sales: any[] = [];
  listings = signal<{ machinery: any[], agriItems: any[] }>({ machinery: [], agriItems: [] });
  isLoading = true;

  // View State
  isEditing = signal(false);
  editingItem = signal<any>(null);
  isViewingDetails = signal(false);
  selectedSale = signal<any>(null);

  // Original data for live sync
  private originalMachinery: any[] = [];
  private originalAgriItems: any[] = [];

  constructor() {
    effect(() => {
      const updates = this.liveStock.stockUpdates();
      if (Object.keys(updates).length === 0) return;

      this.listings.update(current => {
        const updatedMachinery = current.machinery.map(m => {
          const key = `machinery-${m.id}`;
          const reduction = updates[key] || 0;
          return { ...m, quantity: Math.max(0, (this.getOriginalQty('machinery', m.id) || m.quantity) + reduction) };
        });

        const updatedAgriItems = current.agriItems.map(a => {
          const key = `agriitem-${a.id}`;
          const reduction = updates[key] || 0;
          return { ...a, quantity: Math.max(0, (this.getOriginalQty('agriitem', a.id) || a.quantity) + reduction) };
        });

        return { machinery: updatedMachinery, agriItems: updatedAgriItems };
      });
    });
  }

  private getOriginalQty(type: string, id: number) {
    const list = type === 'machinery' ? this.originalMachinery : this.originalAgriItems;
    return list.find(x => x.id === id)?.quantity;
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    this.loadCount = 0;
    
    // Fetch Sales
    this.http.get<any[]>(`${API_URL}/Farmer/sales`).subscribe({
      next: (data) => {
        this.sales = data;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Failed to fetch sales', err);
        this.checkLoading();
      }
    });

    // Fetch My Listings
    this.http.get<any>(`${API_URL}/Farmer/listings`).subscribe({
      next: (data) => {
        const machinery = data.machinery || [];
        const agriItems = data.agriItems || [];
        
        this.originalMachinery = [...machinery];
        this.originalAgriItems = [...agriItems];

        this.listings.set({
            machinery: machinery,
            agriItems: agriItems
        });
        this.checkLoading();
      },
      error: (err) => {
        console.error('Failed to fetch listings', err);
        this.checkLoading();
      }
    });
  }

  private loadCount = 0;
  private checkLoading() {
      this.loadCount++;
      if (this.loadCount >= 2) {
          this.isLoading = false;
      }
  }

  editListing(item: any, type: string) {
    this.editingItem.set({ ...item, type });
    this.isEditing.set(true);
  }

  deleteListing(id: number, type: string) {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    const endpoint = type === 'AgriItem' ? 'AgriItems' : 'Machinery';
    this.http.delete(`${API_URL}/${endpoint}/${id}`).subscribe({
      next: () => {
        alert('Listing deleted successfully');
        this.fetchData();
      },
      error: (err) => alert('Failed to delete listing')
    });
  }

  onSaved() {
    this.isEditing.set(false);
    this.editingItem.set(null);
    this.fetchData();
  }

  closeEdit() {
    this.isEditing.set(false);
    this.editingItem.set(null);
  }

  openSaleDetails(sale: any) {
    this.selectedSale.set(sale);
    this.isViewingDetails.set(true);
  }

  closeSaleDetails() {
    this.isViewingDetails.set(false);
    this.selectedSale.set(null);
  }

  getSoldOutProducts() {
    const productCounts: any = {};
    this.sales.forEach(s => {
      productCounts[s.productName] = (productCounts[s.productName] || 0) + s.quantity;
    });
    return Object.keys(productCounts).map(name => ({ name, qty: productCounts[name] }));
  }

  getTotalEarnings() {
    return this.sales.reduce((acc, s) => acc + (s.price * s.quantity), 0);
  }
}
