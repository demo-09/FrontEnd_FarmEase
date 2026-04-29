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
  otpSent = false;
  otpCode = '';

  // Store email or phone locally during signup
  currentRegistrationContact = '';

  // Form Model
  signupData = {
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    bio: '',
    password: '',
    role: 'customer' as UserRole
  };

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
        
        this.adminInbox.logActivity('Google Login', `User signed up/logged in via Google.`);

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
    this.signupData.role = this.selectedRole;
  }

  onRegister() {
    const { fullName, email, password } = this.signupData;

    // Basic Validation
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      alert('Full Name, Email, and Password are required.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    this.isLoading = true;

    const newUser = {
      ...this.signupData,
      fullName: this.signupData.fullName.trim(),
      email: this.signupData.email.trim(),
      joinedDate: new Date().toISOString()
    };

    this.currentRegistrationContact = email.trim();

    this.http.post(`${this.backendUrl}/initiate-register`, newUser).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.otpSent = true;
        // The mock OTP will fall back to printing in the backend console
        alert(`Account Initialized!\n\n(MOCK OTP for testing: ${res.mockOtp})`);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration failed', err);
        alert(err.error?.message || 'Failed to initiate registration. Please try again.');
      }
    });
  }

  verifyOtp() {
    this.otpCode = this.otpCode.trim();
    if (!this.otpCode) {
      alert('Please enter the OTP');
      return;
    }

    this.isLoading = true;

    this.http.post(`${this.backendUrl}/verify-otp-register`, { emailOrPhone: this.currentRegistrationContact, otpCode: this.otpCode }).subscribe({
      next: (foundUser: any) => {
        this.isLoading = false;
        console.log('Registration Successful', foundUser);

        localStorage.setItem('CurrentUser', JSON.stringify(foundUser.user || foundUser));
        this.auth.login(foundUser.user?.role || foundUser.role);

        this.adminInbox.logActivity('Signup', `New user registered: ${foundUser.user?.fullName || foundUser.fullName} (${foundUser.user?.role || foundUser.role})`);

        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('OTP verification failed', err);
        alert('Invalid OTP or session expired. Please try again.');
      }
    });
  }
}
