import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserRole } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private backendUrl = 'http://localhost:5009/api/auth';
  
  // State Management
  selectedRole: UserRole = 'customer';
  isLoading = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }
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