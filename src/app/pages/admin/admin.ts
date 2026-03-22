import { Component, OnInit, inject } from "@angular/core";
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";

interface Machinery {
  id: number;
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
export class Admin implements OnInit {
  activePage: string = 'dashboard';
  sidebarOpen = false;

  private backendUrl = 'http://localhost:5009/api';

  farmers: any[] = [];
  customers: any[] = [];
  machineries: any[] = [];

  // Track if we are editing an existing item
  isEditing = false;
  editingId: number | null = null;
  newMachinery = { name: '', price: 0, image: '', condition: '', quantity: 1, category: '', description: '' };
  
  // Track Add User Modal
  isAddingUser = false;
  newUser = { fullName: '', email: '', password: '', role: 'farmer', phone: '', address: '' };

  currentAdminName: string = '';
  currentDate: string = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  private router = inject(Router);
  private http = inject(HttpClient);
  
  constructor(public auth: AuthService) { }

  ngOnInit(): void {
    this.checkAdminAccess();
    this.refreshUserLists();
    this.loadMachinery();
  }
  checkAdminAccess(): void {
    const adminString = localStorage.getItem('CurrentUser');
    if (!adminString) {
      this.router.navigate(['/Login']);
      return;
    }
    const admin = JSON.parse(adminString);
    this.currentAdminName = admin.fullName || 'Admin';
    if (admin.role !== 'admin') {
      this.router.navigate(['/Login']);
    }
  }

  // --- USER MANAGEMENT (DELETE/READ) ---

  refreshUserLists(): void {
    this.http.get<any[]>(`${this.backendUrl}/users`).subscribe({
      next: (allUsers) => {
        this.farmers = allUsers.filter((u: any) => u.role === 'farmer').map((u: any) => this.formatUser(u));
        this.customers = allUsers.filter((u: any) => u.role === 'customer').map((u: any) => this.formatUser(u));
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
    this.isAddingUser = true;
    this.newUser = { 
      fullName: '', 
      email: '', 
      password: '', 
      role: this.activePage === 'customers' ? 'customer' : 'farmer', 
      phone: '', 
      address: '' 
    };
  }

  closeAddUserModal(): void {
    this.isAddingUser = false;
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
      error: (err) => {
        console.error('Failed to add user', err);
        alert(err.error?.message || 'Failed to add user. Ensure email is unique.');
      }
    });
  }

  // --- MACHINERY MANAGEMENT (CREATE/UPDATE/DELETE) ---

  handleItemAddOrUpdate(): void {
    if (!this.newMachinery.name || this.newMachinery.price <= 0) {
      alert('Please fill in required fields');
      return;
    }

    if (this.isEditing && this.editingId) {
      // UPDATE logic
      this.http.put(`${this.backendUrl}/machinery/${this.editingId}`, this.newMachinery).subscribe({
        next: () => {
          this.loadMachinery();
          this.resetForm();
        },
        error: (err) => console.error('Failed to update machinery', err)
      });
    } else {
      // CREATE logic
      const machineToSave = {
        ...this.newMachinery,
        image: this.newMachinery.image || 'https://via.placeholder.com/150'
      };
      
      this.http.post(`${this.backendUrl}/machinery`, machineToSave).subscribe({
        next: () => {
          this.loadMachinery();
          this.resetForm();
        },
        error: (err) => console.error('Failed to create machinery', err)
      });
    }
  }

  editMachinery(item: any): void {
    this.isEditing = true;
    this.editingId = item.id;
    this.newMachinery = { ...item };
  }

  handleItemRemove(id: number): void {
    if (confirm('Delete this item from inventory?')) {
      this.http.delete(`${this.backendUrl}/machinery/${id}`).subscribe({
        next: () => this.loadMachinery(),
        error: (err) => console.error('Failed to delete machinery', err)
      });
    }
  }

  setPage(page: string): void {
    this.activePage = page;
    if (page === 'machinery') {
      this.resetForm();
    }
  }

  loadMachinery(): void {
    this.http.get<any[]>(`${this.backendUrl}/machinery`).subscribe({
      next: (data) => this.machineries = data,
      error: (err) => console.error('Failed to load machinery', err)
    });
  }
  
  getTotalValue(): number {
    return this.machineries.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  }
  
  editItem(item: Machinery): void {
    this.isEditing = true;
    this.editingId = item.id;
    this.newMachinery = { ...item };
  }
  
  resetForm() {
    this.newMachinery = { name: '', price: 0, image: '', condition: '', quantity: 1, category: '', description: '' };
    this.isEditing = false;
    this.editingId = null;
  }
}
