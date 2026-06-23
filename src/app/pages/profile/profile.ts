import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

declare var cloudinary: any;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  currentUser: any = null;
  private router = inject(Router);
  public auth = inject(AuthService);
  private http = inject(HttpClient);

  // Edit modal state
  showEditModal = false;
  isSaving = false;
  saveSuccess = false;
  saveError = '';

  // Edit form fields
  editForm = {
    fullName: '',
    phone: '',
    address: '',
    dob: '',
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
    const storedUser = localStorage.getItem('CurrentUser');
    if (!storedUser) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      this.currentUser = JSON.parse(storedUser);
    } catch (error) {
      console.error('Invalid user data', error);
      this.router.navigate(['/login']);
    }
  }

  getAvatarUrl(): string {
    if (this.currentUser?.avatar) return this.currentUser.avatar;
    const name = this.currentUser?.fullName || 'Guest';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f5132&color=fff&bold=true&size=128`;
  }

  editProfile(): void {
    // Populate form with current values
    this.editForm = {
      fullName: this.currentUser?.fullName || this.currentUser?.name || '',
      phone: this.currentUser?.phone || '',
      address: this.currentUser?.address || '',
      dob: this.currentUser?.birthDate || '',
      avatar: this.currentUser?.avatar || ''
    };
    this.saveSuccess = false;
    this.saveError = '';
    this.showEditModal = true;
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
          this.editForm.avatar = result.info.secure_url;
        }
      }
    );
    myWidget.open();
  }

  closeModal(): void {
    this.showEditModal = false;
    this.saveSuccess = false;
    this.saveError = '';
  }

  saveProfile(): void {
    if (!this.editForm.fullName.trim()) {
      this.saveError = 'Full name is required.';
      return;
    }


    this.isSaving = true;
    this.saveError = '';

    const updatedUser = {
      ...this.currentUser,
      fullName: this.editForm.fullName.trim(),
      phone: this.editForm.phone.trim(),
      address: this.editForm.address.trim(),
      birthDate: this.editForm.dob,
      avatar: this.editForm.avatar.trim()
    };

    // INSTANT LOCAL UPDATE (no need to click 3 times!)
    this.currentUser = updatedUser;
    localStorage.setItem('CurrentUser', JSON.stringify(updatedUser));
    
    // Background Sync
    const backendUrl = `${API_URL}/users`;
    this.http.put(`${backendUrl}/${this.currentUser.id}`, updatedUser).subscribe({
      next: (res: any) => {
        this.currentUser = { ...updatedUser, ...res };
        localStorage.setItem('CurrentUser', JSON.stringify(this.currentUser));
        this.finalizeSave();
      },
      error: (err) => {
        console.warn('Backend sync failed, relying on local update:', err);
        // Add a slight artificial delay so the user sees the 'Saving...' state 
        // and doesn't rapidly double-click while waiting for the modal to close.
        setTimeout(() => this.finalizeSave(), 600);
      }
    });
  }

  private finalizeSave() {
    this.isSaving = false;
    this.saveSuccess = true;
    setTimeout(() => {
      this.showEditModal = false;
      this.saveSuccess = false;
    }, 800);
  }
}
