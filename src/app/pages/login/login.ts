import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, AfterViewInit {
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
    const backendUrl = 'https://backend-farmease-1.onrender.com/api/auth';
    
    this.http.post(`${backendUrl}/google`, { idToken: response.credential, role: 'customer' }).subscribe({
      next: (foundUser: any) => {
        localStorage.setItem('CurrentUser', JSON.stringify(foundUser));
        this.auth.login(foundUser.role);
        
        this.cartService.refreshCart();
        this.wishlistService.refreshWishlist();

        this.adminInbox.sendMessage({
          type: 'login',
          title: 'Google Login',
          requester: foundUser.fullName || foundUser.email,
          details: `User logged in via Google with role: ${foundUser.role}`,
          status: 'info'
        });

        this.redirectByRole(foundUser.role);
      },
      error: (err) => {
        console.error('Google login failed', err);
        alert('Google login failed. Please try again.');
      }
    });
  }

  login(email: string, password: string) {

    email = email.trim();
    password = password.trim();

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    const backendUrl = 'https://backend-farmease-1.onrender.com/api/auth';

    this.http.post(`${backendUrl}/login`, { email, password }).subscribe({
      next: (foundUser: any) => {
        // Save current logged in user
        localStorage.setItem('CurrentUser', JSON.stringify(foundUser));

        // ✅ Pass role if required
        this.auth.login(foundUser.role);
        
        // Refresh cart and wishlist upon login
        this.cartService.refreshCart();
        this.wishlistService.refreshWishlist();

        this.adminInbox.sendMessage({
          type: 'login',
          title: 'User Login',
          requester: foundUser.fullName || foundUser.email,
          details: `User logged in with role: ${foundUser.role}`,
          status: 'info'
        });

        // Optional: Redirect by role
        this.redirectByRole(foundUser.role);
      },
      error: (err) => {
        console.error('Login failed', err);
        alert('Invalid email or password');
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
