import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserRole } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
    import { AdminInboxService } from '../../services/admin-inbox.service';

declare var google: any;
declare var cloudinary: any;

import { API_URL } from '../../core/api.config';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit, AfterViewInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private adminInbox = inject(AdminInboxService);

  private backendUrl = `${API_URL}/auth`;
  
  // State Management
  selectedRole: UserRole = 'customer';
  isLoading = false;
  errorMessage = '';
  infoMessage = '';

  // Form Model
  signupData = {
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    bio: '',
    password: '',
    role: 'customer' as UserRole,
    avatar: ''
  };

  presetAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Amaya',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn'
  ];

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
        const msg = err.error?.message || err.message || 'Unknown Error';
        this.errorMessage = `Google registration failed: ${msg}.`;
        this.infoMessage = '';
      }
    });
  }

  setRole(role: string) {
    this.selectedRole = role as UserRole;
    this.signupData.role = this.selectedRole;
  }

  openAvatarUpload() {
    const myWidget = cloudinary.createUploadWidget(
      {
        cloudName: process.env['CLOUDINARY_CLOUD_NAME'] || '',
        uploadPreset: process.env['CLOUDINARY_UPLOAD_PRESET'] || '',
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
          this.signupData.avatar = result.info.secure_url;
        }
      }
    );
    myWidget.open();
  }

  onRegister() {
    const { fullName, email, password } = this.signupData;

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      this.errorMessage = 'Full Name, Email, and Password are required.';
      this.infoMessage = '';
      return;
    }

    if (password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      this.infoMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = 'Creating account...';

    const newUser = {
      ...this.signupData,
      fullName: this.signupData.fullName.trim(),
      email: this.signupData.email.trim(),
      joinedDate: new Date().toISOString()
    };

    this.http.post(
      `${this.backendUrl}/register`,
      newUser
    ).subscribe({
      next: (foundUser: any) => {
        this.isLoading = false;
        this.infoMessage = 'Registration Successful!';
        this.errorMessage = '';
        console.log('Registration Successful', foundUser);

        localStorage.setItem('CurrentUser', JSON.stringify(foundUser.user || foundUser));
        this.auth.login(foundUser.user?.role || foundUser.role);

        this.adminInbox.logActivity('Signup', `New user registered: ${foundUser.user?.fullName || foundUser.fullName} (${foundUser.user?.role || foundUser.role})`);

        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration failed', err);
        this.errorMessage = err.error?.message || err.message || 'Failed to register account.';
        this.infoMessage = '';
      }
    });
  }
}
