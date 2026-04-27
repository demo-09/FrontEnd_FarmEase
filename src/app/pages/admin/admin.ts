import { Component, OnInit, OnDestroy, inject, signal, computed } from "@angular/core";
import { AuthService } from '../../core/services/auth.service';
import { AdminInboxService } from '../../services/admin-inbox.service';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin implements OnInit, OnDestroy {
  activePage = signal('dashboard');
  sidebarOpen = signal(false);

  private backendUrl = 'https://backend-farmease-1.onrender.com/api';

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
  newItem = { type: 'machinery', name: '', price: 0, image: '', condition: '', quantity: 1, category: '', description: '' };
  
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
  
  // Track Add User Modal
  isAddingUser = signal(false);
  newUser = { fullName: '', email: '', password: '', role: 'farmer', phone: '', address: '' };

  currentAdminName = signal('');
  currentDate = signal(new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  private router = inject(Router);
  private http = inject(HttpClient);
  public auth = inject(AuthService);
  public inbox = inject(AdminInboxService);

  ngOnInit(): void {
    this.checkAdminAccess();
    this.refreshUserLists();
    this.loadInventory();
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
      address: '' 
    };
  }

  closeAddUserModal(): void {
    this.isAddingUser.set(false);
  }

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

  handleItemAddOrUpdate(): void {
    if (!this.newItem.name || this.newItem.price <= 0) {
      alert('Please fill in required fields');
      return;
    }

    const endpoint = this.newItem.type === 'agriitem' ? 'agriitems' : 'machinery';
    const body = { ...this.newItem };

    if (this.isEditing() && this.editingId()) {
      // UPDATE logic
      this.http.put(`${this.backendUrl}/${endpoint}/${this.editingId()}`, body).subscribe({
        next: () => {
          this.loadInventory();
          this.resetForm();
        },
        error: (err: any) => console.error(`Failed to update ${this.newItem.type}`, err)
      });
    } else {
      // CREATE logic
      const itemToSave = {
        ...body,
        image: body.image || 'https://via.placeholder.com/150'
      };
      
      this.http.post(`${this.backendUrl}/${endpoint}`, itemToSave).subscribe({
        next: () => {
          this.loadInventory();
          this.resetForm();
        },
        error: (err) => console.error(`Failed to create ${this.newItem.type}`, err)
      });
    }
  }

  editItem(item: any): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.newItem = { ...item };
    if (!this.newItem.type) this.newItem.type = 'machinery'; // fallback
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

  setPage(page: string): void {
    this.activePage.set(page);
    if (page === 'machinery' || page === 'inventory') {
      this.resetForm();
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

  loadInventory(): void {
    forkJoin({
      machinery: this.http.get<any[]>(`${this.backendUrl}/machinery`).pipe(catchError(() => of([]))),
      agriitems: this.http.get<any[]>(`${this.backendUrl}/agriitems`).pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        const m = res.machinery.map(x => ({ ...x, type: 'machinery', image: x.image || '' }));
        const a = res.agriitems.map(x => ({ ...x, type: 'agriitem', image: x.image || '' }));
        this.inventoryItems.set([...m, ...a]);
      },
      error: (err) => console.error('Failed to load inventory', err)
    });
  }
  
  resetForm() {
    this.newItem = { type: 'machinery', name: '', price: 0, image: '', condition: '', quantity: 1, category: '', description: '' };
    this.isEditing.set(false);
    this.editingId.set(null);
  }
}

