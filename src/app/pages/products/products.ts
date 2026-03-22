import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { WishlistService, WishlistItem } from '../wishlist/wishlist';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  isLoading = true;
  products: any[] = [];
  selectedProduct: any = null;        // For detail modal
  selectedQty = 1;
  toastMessage = '';
  showToast = false;

  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);

  ngOnInit(): void { this.refreshProducts(); }

  refreshProducts(): void {
    this.isLoading = true;
    this.products = [];

    forkJoin({
      machinery: this.http.get<any[]>('http://localhost:5009/api/machinery'),
      agriitems: this.http.get<any[]>('http://localhost:5009/api/agriitems')
    }).subscribe({
      next: (res) => {
        const allItems = [...res.machinery, ...res.agriitems];

        this.products = allItems.map(item => ({
          id: item.id,
          title: item.name || 'Untitled Product',
          subtitle: item.category || 'Product Category',
          description: item.description || `High-quality ${item.name} available now.`,
          imageUrl: item.image || '',
          label: item.quantity > 0 ? 'In Stock' : 'Out of Stock',
          inStock: item.quantity > 0,
          metaText: `₹${item.price}`,
          price: item.price,
          quantity: item.quantity,
          action: () => this.viewProduct(item)
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch:', err);
        this.isLoading = false;
      }
    });
  }

  // ── Cart ──
  addToCart(product: any, qty = 1) {
    this.cartService.addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.imageUrl,
      category: product.subtitle,
    });
    this.showNotification(`✅ ${product.title} added to cart`);
  }

  isInCart(id: number) { return this.cartService.isInCart(id); }

  // ── Wishlist ──
  toggleWishlist(product: any) {
    if (this.wishlistService.isInWishlist(product.id)) {
      this.wishlistService.remove(product.id);
      this.showNotification(`💔 Removed from wishlist`);
    } else {
      this.wishlistService.addItem({
        id: product.id,
        name: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        category: product.subtitle
      } as WishlistItem);
      this.showNotification(`❤️ ${product.title} saved to wishlist`);
    }
  }

  isInWishlist(id: number) { return this.wishlistService.isInWishlist(id); }

  // ── Modal ──
  viewProduct(product: any) {
    this.selectedProduct = product;
    this.selectedQty = 1;
  }

  closeModal() { this.selectedProduct = null; }

  addModalToCart() {
    this.addToCart(this.selectedProduct, this.selectedQty);
    this.closeModal();
  }

  // ── Toast ──
  showNotification(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 2500);
  }
  // ── Contact Links ──
  getWhatsAppLink(product: any): string {
    const phone = '919876543210'; // Placeholder mockup caller
    const text = encodeURIComponent(`Hello! I'm interested in your product on FarmEase: ${product.title}`);
    return `https://wa.me/${phone}?text=${text}`;
  }

  getPhoneLink(): string {
    return 'tel:+919876543210';
  }

  getMailLink(product: any): string {
    const email = 'farmer@farmease.in';
    const subject = encodeURIComponent(`FarmEase Inquiry: ${product.title}`);
    const body = encodeURIComponent(`Hi,\n\nI found your ${product.title} on FarmEase and would like to know more...`);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  getVideoCallLink(): string {
    // Generalized video meeting creation deep link (Google Meet as a reliable cross-platform fallback)
    return 'https://meet.google.com/new'; 
  }
}
