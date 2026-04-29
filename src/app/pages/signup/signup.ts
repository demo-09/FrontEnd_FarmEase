import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserRole } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { AdminInboxService } from '../../services/admin-inbox.service';

declare var google: any;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit, AfterViewInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private adminInbox = inject(AdminInboxService);

  private backendUrl = 'https://backend-farmease-1.onrender.com/api/auth';
  
  // State Management
  selectedRole: UserRole = 'customer';
  isLoading = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
  }

  ngAfterViewInit(): void {
    const checkGoogle = setInterval(() => {
      if (typeof google !== 'undefined' && document.getElementById('google-btn-signup')) {
        clearInterval(checkGoogle);
        google.accounts.id.initialize({
          client_id: '360775516641-oeppopoi7lbfues9mfnvcreciuin7u97.apps.googleusercontent.com',
          callback: this.handleGoogleCredentialResponse.bind(this)
        });
        google.accounts.id.renderButton(
          document.getElementById('google-btn-signup'),
          { theme: 'outline', size: 'large', width: '300px' }
        );
      }
    }, 100);
  }

  handleGoogleCredentialResponse(response: any) {
    this.http.post(`${this.backendUrl}/google`, { idToken: response.credential, role: this.selectedRole }).subscribe({
      next: (foundUser: any) => {
        localStorage.setItem('CurrentUser', JSON.stringify(foundUser));
        this.auth.login(foundUser.role);
        
        this.adminInbox.sendMessage({
          type: 'signup',
          title: 'Google Signup/Login',
          requester: foundUser.fullName || foundUser.email,
          details: `User signed up/logged in via Google with role: ${foundUser.role}`,
          status: 'info'
        });

        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Google registration failed', err);
        alert('Google registration failed. Please try again.');
      }
    });
  }

  setRole(role: string) {
    this.selectedRole = role as UserRole;
  }

  onRegister(
    name: string,
    email: string,
    phone: string,
    dob: string,
    address: string,
    bio: string,
    pass: string
  ) {
    // Basic Validation
    if (!name.trim() || !email.trim() || !pass.trim()) {
      alert('Full Name, Email, and Password are required.');
      return;
    }

    if (pass.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    this.isLoading = true;

    const newUser = {
      fullName: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthDate: dob,
      address: address.trim(),
      bio: bio.trim(),
      password: pass.trim(),
      role: this.selectedRole,
      joinedDate: new Date().toISOString()
    };

    this.http.post(`${this.backendUrl}/register`, newUser).subscribe({
      next: (res) => {
        console.log('Registration Successful', res);

        this.adminInbox.sendMessage({
          type: 'signup',
          title: 'New User Registered',
          requester: newUser.fullName,
          details: `Registered as ${newUser.role}. Email: ${newUser.email}`,
          status: 'info'
        });

        this.router.navigate(['/Login']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration failed', err);
        alert(err.error?.message || 'Failed to create account. Please try again.');
      }
    });
  }
}
