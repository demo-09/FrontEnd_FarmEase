import { Injectable, inject } from '@angular/core';
import { AdminInboxService } from '../../services/admin-inbox.service';

export type UserRole = 'admin' | 'farmer' | 'customer';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private inbox = inject(AdminInboxService);

  private currentUser: { name: string; role: UserRole } | null = null;

  login(role: UserRole) {
    this.currentUser = { name: 'User', role };
    localStorage.setItem('user_role', role);
  }

  logout() {
    this.inbox.logActivity('Logout', 'User logged out of the session.');
    this.currentUser = null;
    localStorage.removeItem('user_role');
    localStorage.removeItem('CurrentUser');
  }

  isLoggedIn(): boolean {
    return !!this.getRole();
  }

  getRole(): UserRole | null {
    return (localStorage.getItem('user_role') as UserRole) || null;
  }

  get isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  get isFarmer(): boolean {
    return this.getRole() === 'farmer';
  }

  get isCustomer(): boolean {
    return this.getRole() === 'customer';
  }
}
