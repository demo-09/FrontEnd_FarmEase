import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { API_URL } from '../../core/api.config';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../wishlist/wishlist';
import { AdminInboxService } from '../../services/admin-inbox.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, AfterViewInit {
  emailOrPhone = '';
  password = '';
  showPass = false;
  errorMessage = '';
  infoMessage = '';

  auth = inject(AuthService);
  router = inject(Router);
  http = inject(HttpClient);
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  adminInbox = inject(AdminInboxService);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
  }

  ngAfterViewInit(): void {
    // Wait for Google script to load if necessary
    const checkGoogle = setInterval(() => {
      if (typeof google !== 'undefined' && document.getElementById('google-btn')) {
        clearInterval(checkGoogle);
        google.accounts.id.initialize({
          client_id: '360775516641-oeppopoi7lbfues9mfnvcreciuin7u97.apps.googleusercontent.com',
          callback: this.handleGoogleCredentialResponse.bind(this)
        });
        google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          { theme: 'outline', size: 'large', width: '300px' }
        );
      }
    }, 100);
  }

  handleGoogleCredentialResponse(response: any) {
    const backendUrl = `${API_URL}/auth`;
    
    this.http.post(`${backendUrl}/google`, { idToken: response.credential, role: 'customer' }).subscribe({
      next: (foundUser: any) => {
        localStorage.setItem('CurrentUser', JSON.stringify(foundUser));
        this.auth.login(foundUser.role);
        
        this.cartService.refreshCart();
        this.wishlistService.refreshWishlist();

        this.adminInbox.logActivity('Google Login', `User logged in via Google.`);

        this.redirectByRole(foundUser.role);
      },
      error: (err) => {
        console.error('Google login failed', err);
        const msg = err.error?.message || err.message || 'Unknown Error';
        this.errorMessage = `Google login failed: ${msg}. Check console for details.`;
        this.infoMessage = '';
      }
    });
  }

  login() {
    this.emailOrPhone = this.emailOrPhone.trim();
    this.password = this.password.trim();

    if (!this.emailOrPhone || !this.password) {
      this.errorMessage = 'Please enter an Email/Phone and Password';
      this.infoMessage = '';
      return;
    }

    const backendUrl = `${API_URL}/auth`;
    this.infoMessage = 'Signing in...';
    this.errorMessage = '';

    this.http.post(`${backendUrl}/login`, { email: this.emailOrPhone, password: this.password }).subscribe({
      next: (foundUser: any) => {
        this.infoMessage = 'Login Successful!';
        this.errorMessage = '';
        localStorage.setItem('CurrentUser', JSON.stringify(foundUser));
        this.auth.login(foundUser.role);
        this.cartService.refreshCart();
        this.wishlistService.refreshWishlist();
        this.adminInbox.logActivity('Login', `User logged in directly.`);

        this.redirectByRole(foundUser.role);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage = err.error?.message || err.message || 'Invalid email/phone or password.';
        this.infoMessage = '';
      }
    });
  }

  private redirectByRole(role: string) {
    if (role === 'farmer') {
      this.router.navigate(['/']);
    } else if (role === 'customer') {
      this.router.navigate(['/']);
    } else if (role === 'admin') {
      this.router.navigate(['/admin/Admin']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
