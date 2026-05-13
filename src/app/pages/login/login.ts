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
  otpCode = '';
  otpSent = false;
  showPass = false;

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
        alert('Google login failed. Please try again.');
      }
    });
  }

  login() {
    this.emailOrPhone = this.emailOrPhone.trim();
    this.password = this.password.trim();

    if (!this.emailOrPhone || !this.password) {
      alert('Please enter an Email/Phone and Password');
      return;
    }

    const backendUrl = `${API_URL}/auth`;
    this.http.post(`${backendUrl}/initiate-login`, { emailOrPhone: this.emailOrPhone, password: this.password }).subscribe({
      next: (res: any) => {
        this.otpSent = true;
        // Mock OTP alert removed for real email delivery
      },
      error: (err) => {
        console.error('Failed to initiate login', err);
        alert('Invalid email/phone or password.');
      }
    });
  }

  verifyOtp() {
    this.otpCode = this.otpCode.trim();
    if (!this.otpCode) {
      alert('Please enter the OTP');
      return;
    }

    const backendUrl = `${API_URL}/auth`;
    this.http.post(`${backendUrl}/verify-otp-login`, { emailOrPhone: this.emailOrPhone, otpCode: this.otpCode }).subscribe({
      next: (foundUser: any) => {
        localStorage.setItem('CurrentUser', JSON.stringify(foundUser));
        this.auth.login(foundUser.role);
        
        this.cartService.refreshCart();
        this.wishlistService.refreshWishlist();

        this.adminInbox.logActivity('Login', `User logged in via OTP.`);

        // Optional: Redirect by role
        this.redirectByRole(foundUser.role);
      },
      error: (err) => {
        console.error('OTP verification failed', err);
        alert('Invalid OTP. Please try again.');
      }
    });
  }

  changeLoginDetails() {
    this.otpSent = false;
    this.otpCode = '';
    // Optional: Keep password or clear it
    this.password = '';
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
