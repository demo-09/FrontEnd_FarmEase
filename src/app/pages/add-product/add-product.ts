import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddProductForm } from '../../shared/components/add-product-form/add-product';

@Component({
  selector: 'app-add-product-page',
  standalone: true,
  imports: [CommonModule, AddProductForm],
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.css']
})
export class AddProduct {
  private router = inject(Router);

  selectedCategory = signal<string>('');

  categories = [
    { name: 'Vegetables', icon: 'fa-carrot', type: 'agriitem', desc: 'Fresh crops & organic produce' },
    { name: 'Fruits', icon: 'fa-apple-whole', type: 'agriitem', desc: 'Seasonal & exotic fruits' },
    { name: 'Machinery', icon: 'fa-tractor', type: 'machinery', desc: 'Tractors, Harvesters & parts' },
    { name: 'Tools', icon: 'fa-wrench', type: 'machinery', desc: 'Hand tools & small equipment' }
  ];

  selectCategory(cat: string) {
    this.selectedCategory.set(cat);
  }

  onSaved() {
    this.router.navigate(['/my-sales']);
  }

  onCancel() {
    if (this.selectedCategory()) {
      this.selectedCategory.set('');
    } else {
      this.router.navigate(['/my-sales']);
    }
  }
}
