import { Component, Input, Output, EventEmitter, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../core/api.config';

declare var cloudinary: any;

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css'
})
export class AddProduct implements OnChanges {
  @Input() isEditing = false;
  @Input() editingId: number | null = null;
  @Input() selectedCategory = '';
  @Input() editData: any = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private http = inject(HttpClient);
  private backendUrl = API_URL;

  newItem: any = { 
    type: 'machinery', 
    name: '', 
    price: 0, 
    image: '', 
    condition: 'Fresh', 
    quantity: 1, 
    category: '', 
    description: '',
    media: []
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editData'] && this.editData) {
      this.newItem = { ...this.editData };
    }
    if (changes['selectedCategory'] && this.selectedCategory && !this.isEditing) {
      this.newItem.category = this.selectedCategory;
      this.newItem.type = (this.selectedCategory === 'Machinery' || this.selectedCategory === 'Tools') ? 'machinery' : 'agriitem';
      
      // Default conditions
      if (this.newItem.type === 'machinery') this.newItem.condition = 'New';
      else this.newItem.condition = 'Fresh';
    }
  }

  openProductMediaUpload() {
    cloudinary.openUploadWidget(
      {
        cloudName: 'djp74r2pg',
        uploadPreset: 'FARMEASE',
        sources: ['local', 'url', 'camera'],
        showAdvancedOptions: false,
        cropping: true,
        multiple: true,
        defaultSource: 'local'
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          const mediaItem = {
            url: result.info.secure_url,
            publicId: result.info.public_id,
            mediaType: result.info.resource_type === 'video' ? 'video' : 'image',
            isPrimary: this.newItem.media.length === 0
          };
          this.newItem.media.push(mediaItem);
          if (mediaItem.isPrimary) this.newItem.image = mediaItem.url;
        }
      }
    );
  }

  setPrimaryMedia(index: number) {
    this.newItem.media.forEach((m: any, i: number) => m.isPrimary = i === index);
    this.newItem.image = this.newItem.media[index].url;
  }

  removeMedia(index: number) {
    const removed = this.newItem.media.splice(index, 1)[0];
    if (removed.isPrimary && this.newItem.media.length > 0) {
      this.newItem.media[0].isPrimary = true;
      this.newItem.image = this.newItem.media[0].url;
    } else if (this.newItem.media.length === 0) {
      this.newItem.image = '';
    }
  }

  handleItemAddOrUpdate(): void {
    if (!this.newItem.name || this.newItem.price <= 0) {
      alert('Please fill in required fields');
      return;
    }

    const endpoint = this.newItem.type === 'agriitem' ? 'agriitems' : 'machinery';
    const body = { ...this.newItem };

    if (this.isEditing && this.editingId) {
      this.http.put(`${this.backendUrl}/${endpoint}/${this.editingId}`, body).subscribe({
        next: () => this.saved.emit(),
        error: (err: any) => console.error(`Failed to update ${this.newItem.type}`, err)
      });
    } else {
      const itemToSave = { ...body, image: body.image || 'https://via.placeholder.com/150' };
      this.http.post(`${this.backendUrl}/${endpoint}`, itemToSave).subscribe({
        next: () => this.saved.emit(),
        error: (err) => console.error(`Failed to create ${this.newItem.type}`, err)
      });
    }
  }

  resetForm() {
    this.cancel.emit();
  }
}
