import { Component, OnInit, OnDestroy, inject, signal, computed } from "@angular/core";
import { AuthService } from '../../core/services/auth.service';
import { AdminInboxService } from '../../services/admin-inbox.service';
import { LiveStockService } from '../../services/live-stock.service';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { effect } from '@angular/core';
import { AddProductForm } from '../../shared/components/add-product-form/add-product';

interface InventoryItem {
  id: number;
  type: string;
  name: string;
  price: number;
  image: string;
  condition: string;
  quantity: number;
  category: string;
  description: string;
}

import { API_URL } from "../../core/api.config";

declare var cloudinary: any;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AddProductForm],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin implements OnInit, OnDestroy {
  activePage = signal('dashboard');
  sidebarOpen = signal(false);

  private backendUrl = API_URL;

  farmers = signal<any[]>([]);
  customers = signal<any[]>([]);
  inventoryItems = signal<any[]>([]);

  // Computed totals
  totalValue = computed(() => {
    return this.inventoryItems().reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 0)), 0);
  });

  // Track if we are editing an existing item
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  selectedCategory = signal<string>('');
  editingData = signal<any>(null);
  
  // Smart/Analytics Mock State
  aiInsights = [
    { title: 'Sales Spiked', desc: 'Wheat seed orders increased 20% in the last 48 hours.', icon: 'fa-arrow-trend-up', color: 'text-success' },
    { title: 'Optimal Restock', desc: 'Fertilizer stocks are low in processing hubs. Consider restocking before monsoon.', icon: 'fa-lightbulb', color: 'text-warning' },
    { title: 'Farmer Engagement', desc: 'Community forum activity is up by 40%.', icon: 'fa-users', color: 'text-primary' }
  ];

  fraudAlerts = [
    { id: 'ALT-1090', user: 'Unknown IP', issue: 'Multiple failed OTP attempts (5x)', severity: 'high', time: '10 mins ago' },
    { id: 'ALT-1091', user: 'Kisan Traders', issue: 'Suspicious bulk order outside serviceable region.', severity: 'medium', time: '2 hrs ago' }
  ];
  
  // Mobile Sidebar State
  isSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  // Track Add User Modal
  isAddingUser = signal(false);
  newUser = { fullName: '', email: '', password: '', role: 'farmer', phone: '', address: '', birthDate: '', avatar: '' };

  presetAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Amaya',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn'
  ];

  currentAdminName = signal('');
  currentAdminAvatar = signal('');
  currentDate = signal(new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  private router = inject(Router);
  private http = inject(HttpClient);
  public auth = inject(AuthService);
  public inbox = inject(AdminInboxService);
  public liveStock = inject(LiveStockService);

  // Track original quantities to apply live reductions
  private originalQuantities: Record<string, number> = {};

  constructor() {
    // Live Stock Sync Effect
    effect(() => {
      const updates = this.liveStock.stockUpdates();
      const currentItems = this.inventoryItems();
      
      if (currentItems.length > 0 && Object.keys(updates).length > 0) {
        this.inventoryItems.update(items => items.map(item => {
          const compositeKey = `${item.type?.toLowerCase()}-${item.id}`;
          const reduction = (updates as any)[compositeKey] || 0;
          const original = this.originalQuantities[`${item.type}-${item.id}`] ?? item.quantity;
          
          return {
            ...item,
            quantity: Math.max(0, original + reduction)
          };
        }));
      }
    });
  }

  getAvatarUrl(user: any): string {
    if (user?.avatar) return user.avatar;
    const name = user?.fullName || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff&bold=true`;
  }

  setPage(page: string): void {
    this.activePage.set(page);
    this.isSidebarOpen.set(false);
    if (page === 'machinery' || page === 'inventory' || page === 'AddProduct') {
      this.resetForm();
    }
  }

  selectCategory(cat: string, type: string) {
    this.selectedCategory.set(cat);
  }

  ngOnInit(): void {
    this.checkAdminAccess();
    this.refreshUserLists();
    this.loadInventory();
    // Inbox is now managed automatically by AdminInboxService polling
  }

  ngOnDestroy(): void {
    // Teardown
  }

  checkAdminAccess(): void {
    const adminString = localStorage.getItem('CurrentUser');
    if (!adminString) {
      this.router.navigate(['/Login']);
      return;
    }
    const admin = JSON.parse(adminString);
    this.currentAdminName.set(admin.fullName || 'Admin');
    this.currentAdminAvatar.set(admin.avatar || '');
    if (admin.role !== 'admin') {
      this.router.navigate(['/Login']);
    }
  }

  // --- USER MANAGEMENT (DELETE/READ) ---

  refreshUserLists(): void {
    this.http.get<any[]>(`${this.backendUrl}/users`).subscribe({
      next: (allUsers) => {
        this.farmers.set(allUsers.filter((u: any) => u.role === 'farmer').map((u: any) => this.formatUser(u)));
        this.customers.set(allUsers.filter((u: any) => u.role === 'customer').map((u: any) => this.formatUser(u)));
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  private formatUser(u: any) {
    return {
      ...u,
      avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.fullName}&background=${u.role === 'farmer' ? '2e7d32' : '1e293b'}&color=fff`
    };
  }

  handleUserDelete(email: string): void {
    if (confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      this.http.delete(`${this.backendUrl}/users/${encodeURIComponent(email)}`).subscribe({
        next: () => this.refreshUserLists(),
        error: (err) => console.error('Failed to delete user', err)
      });
    }
  }

  openAddUserModal(): void {
    this.isAddingUser.set(true);
    this.newUser = { 
      fullName: '', 
      email: '', 
      password: '', 
      role: this.activePage() === 'customers' ? 'customer' : 'farmer', 
      phone: '', 
      address: '' ,
      birthDate: '',
      avatar: ''
    };
  }

  closeAddUserModal(): void {
    this.isAddingUser.set(false);
  }

  openAvatarUpload() {
    const myWidget = cloudinary.createUploadWidget(
      {
        cloudName: 'djp74r2pg',
        uploadPreset: 'FARMEASE',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        cropping: true,
        showSkipCropButton: false,
        croppingAspectRatio: 1,
        resourceType: 'image',
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp']
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          this.newUser.avatar = result.info.secure_url;
        }
      }
    );
    myWidget.open();
  }

  // --- PRODUCT MEDIA ---
  submitNewUser(): void {
    if (!this.newUser.fullName || !this.newUser.email || !this.newUser.password) {
      alert('Please fill out all required fields.');
      return;
    }

    this.http.post(`${this.backendUrl}/auth/register`, this.newUser).subscribe({
      next: () => {
        this.closeAddUserModal();
        this.refreshUserLists();
      },
      error: (err: any) => {
        console.error('Failed to add user', err);
        alert(err.error?.message || 'Failed to add user. Ensure email is unique.');
      }
    });
  }

  // --- MACHINERY & AGRI-ITEMS MANAGEMENT (CREATE/UPDATE/DELETE) ---

  editItem(item: any): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.editingData.set({ ...item });
  }

  handleItemRemove(item: any): void {
    if (confirm(`Delete this product from inventory?`)) {
      const endpoint = item.type === 'agriitem' ? 'agriitems' : 'machinery';
      this.http.delete(`${this.backendUrl}/${endpoint}/${item.id}`).subscribe({
        next: () => {
          // Update signals instantly but also hit the backend again to guarantee complete sync
          this.inventoryItems.update(items => items.filter(i => !(i.id == item.id && i.type === item.type)));
          this.loadInventory();
        },
        error: (err) => {
          console.error(`Failed to delete`, err);
          alert('Failed to delete item from catalog: ' + (err.error?.message || err.message));
        }
      });
    }
  }
  // Inbox Actions
  approveRequest(id: string) {
    this.inbox.approveRequest(id);
    if (id.startsWith('REQ-')) {
      alert(`Request ${id} approved successfully and requester notified.`);
    }
  }

  rejectRequest(id: string) {
    this.inbox.rejectRequest(id);
  }

  resetInventory(): void {
    if (confirm('CRITICAL: This will remove ALL current products and restore the default catalog. Are you absolutely sure?')) {
      this.http.post(`${this.backendUrl}/machinery/reset`, {}).subscribe({
        next: (res: any) => {
          alert(res.message || 'Inventory reset successfully!');
          this.loadInventory();
        },
        error: (err) => {
          console.error('Reset failed', err);
          alert('Failed to reset inventory: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  loadInventory(): void {
    forkJoin({
      machinery: this.http.get<any[]>(`${this.backendUrl}/machinery`).pipe(catchError(() => of([]))),
      agriitems: this.http.get<any[]>(`${this.backendUrl}/agriitems`).pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        const m = res.machinery.map(x => ({ ...x, type: 'machinery', image: x.image || '' }));
        const a = res.agriitems.map(x => ({ ...x, type: 'agriitem', image: x.image || '' }));
        const all = [...m, ...a];
        
        // Store original quantities for live sync
        all.forEach(item => {
          this.originalQuantities[`${item.type}-${item.id}`] = item.quantity;
        });
        
        this.inventoryItems.set(all);
      },
      error: (err) => console.error('Failed to load inventory', err)
    });
  }
  
  resetForm() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.selectedCategory.set('');
    this.editingData.set(null);
  }
}

