import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { WishlistService, WishlistItem } from '../wishlist/wishlist';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);

  // ── Data Fetching via toSignal ──
  private productsData = toSignal(
    forkJoin({
      machinery: this.http.get<any[]>('https://backend-farmease-1.onrender.com/api/machinery').pipe(catchError(() => of([]))),
      agriitems: this.http.get<any[]>('https://backend-farmease-1.onrender.com/api/agriitems').pipe(catchError(() => of([])))
    }).pipe(
      map(res => {
        const m = res.machinery.map(x => ({ ...x, type: 'machinery' }));
        const a = res.agriitems.map(x => ({ ...x, type: 'agriitem' }));

        return [...m, ...a].map(item => ({
          id: item.id,
          type: item.type,
          title: item.name || 'Untitled Product',
          subtitle: item.category || 'Product Category',
          description: item.description || `High-quality ${item.name} available now.`,
          imageUrl: item.image || '',
          label: item.quantity > 0 ? 'In Stock' : 'Out of Stock',
          inStock: item.quantity > 0,
          metaText: `₹${item.price}`,
          price: item.price,
          quantity: item.quantity
        }));
      })
    ),
    { initialValue: undefined } // undefined means still loading
  );
  constructor(public auth: AuthService) { };
  isLoading = computed(() => this.productsData() === undefined);
  products = computed(() => this.productsData() || []);

  // ── UI States ──
  toastMessage = signal('');
  showToast = signal(false);

  // ── Filters & Search Signals ──
  searchQuery = signal('');
  selectedCategories = signal<Set<string>>(new Set());
  inStockOnly = signal(false);
  sortOption = signal('default');

  // Dynamically calculate available categories
  availableCategories = computed(() => {
    // using subtitle since it maps to item.category
    const cats = new Set(this.products().map(p => p.subtitle));
    return Array.from(cats).filter(c => c && c !== 'Product Category');
  });

  // Live filtered rendering signal
  filteredProducts = computed(() => {
    let result = this.products();

    // Text Search
    const search = this.searchQuery().toLowerCase();
    if (search) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(search) || 
        p.subtitle.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    // Category Filter
    const categories = this.selectedCategories();
    if (categories.size > 0) {
      result = result.filter(p => categories.has(p.subtitle));
    }

    // Stock Filter
    if (this.inStockOnly()) {
      result = result.filter(p => p.inStock);
    }

    // Sort
    const sort = this.sortOption();
    if (sort === 'priceAsc') {
      result = result.slice().sort((a, b) => a.price - b.price);
    } else if (sort === 'priceDesc') {
      result = result.slice().sort((a, b) => b.price - a.price);
    } else if (sort === 'nameAsc') {
      result = result.slice().sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  });

  // ── Filter Interaction Methods ──
  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  updateSort(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.sortOption.set(select.value);
  }

  toggleCategory(cat: string) {
    const current = new Set(this.selectedCategories());
    if (current.has(cat)) current.delete(cat);
    else current.add(cat);
    this.selectedCategories.set(current);
  }

  toggleInStock(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.inStockOnly.set(checkbox.checked);
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedCategories.set(new Set());
    this.inStockOnly.set(false);
    this.sortOption.set('default');
  }

  // ── Cart ──
 

private tempInCartIds = signal<Set<number>>(new Set());

  addToCart(product: any, qty = 1, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    // Add item to cart
    this.cartService.addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.imageUrl,
      category: product.subtitle,
    });

    // Show temporary "In Cart" for 1 second
    this.showTemporaryInCart(product.id);
  }

  // New method

  private showTemporaryInCart(id: number) {

    // ADD (create new Set)
    this.tempInCartIds.update(prev => {
      const updated = new Set(prev);
      updated.add(id);
      return updated;
    });

    // REMOVE after 1 sec
    setTimeout(() => {
      this.tempInCartIds.update(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    }, 1000); // ⚠️ use 1000ms, not 100
  }

  isInCart(id: number): boolean {
    return this.tempInCartIds().has(id);
  }

  // ── Wishlist ──
  toggleWishlist(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.wishlistService.isInWishlist(product.id)) {
      this.wishlistService.removeByProductId(product.id);
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

  // ── Navigation ──
  private router = inject(Router);
  
  viewProduct(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.router.navigate(['/product-detail', product.type, product.id]);
  }

  // ── Toast ──
  showNotification(msg: string) {
    this.toastMessage.set(msg);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2500);
  }
}
