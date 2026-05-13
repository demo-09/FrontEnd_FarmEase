import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { WishlistService, WishlistItem } from '../wishlist/wishlist';
import { AuthService } from '../../core/services/auth.service';
import { AdminInboxService } from '../../services/admin-inbox.service';
import { LiveStockService } from '../../services/live-stock.service';

import { API_URL } from '../../core/api.config';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail {
  qty = 1;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  public cartService = inject(CartService);
  public wishlistService = inject(WishlistService);
  public inbox = inject(AdminInboxService);
  public liveStock = inject(LiveStockService);

  constructor(public auth: AuthService) {
    // Log product view when it successfully loads
    effect(() => {
      const p = this.product();
      if (p) {
        this.inbox.logActivity('Product Viewed', `Viewed product: ${p.title} (${p.type})`);
      }
    });
  }
  private routeParams = toSignal(this.route.paramMap, { initialValue: null });

  activeMediaIndex = signal(0);

  private allData = toSignal(
    forkJoin({
      machinery: this.http.get<any[]>(`${API_URL}/machinery`).pipe(catchError(() => of([]))),
      agriitems: this.http.get<any[]>(`${API_URL}/agriitems`).pipe(catchError(() => of([])))
    }).pipe(
      map(res => {
        const m = res.machinery.map(x => ({ ...x, type: 'machinery' }));
        const a = res.agriitems.map(x => ({ ...x, type: 'agriitem' }));
        return [...m, ...a].map(item => ({
          id: item.id?.toString() || '',
          type: item.type,
          title: item.name || 'Untitled Product',
          subtitle: item.category || 'Product Category',
          description: item.description || `High-quality ${item.name} available now.`,
          imageUrl: item.image || '',
          media: item.media || [],
          price: item.price,
          quantity: item.quantity
        }));
      })
    ),
    { initialValue: undefined }
  );

  // Combine base data with live stock updates
  private liveData = computed(() => {
    const base = this.allData() || [];
    const stockUpdates = this.liveStock.stockUpdates();
    const overrides = this.liveStock.productOverrides();

    return base.map(p => {
      const compositeKey = `${p.type?.toLowerCase()}-${p.id}`;
      
      // Apply full object overrides if any (name, price, image, etc.)
      const override = overrides[compositeKey];
      const merged = override ? {
         ...p,
         title: override.name || p.title,
         price: override.price ?? p.price,
         imageUrl: override.image ?? p.imageUrl,
         quantity: override.quantity ?? p.quantity
      } : p;

      // Apply dynamic stock reductions
      const reduction = stockUpdates[compositeKey] || 0;
      const currentQty = Math.max(0, (merged.quantity || 0) + reduction);

      return {
        ...merged,
        quantity: currentQty,
        inStock: currentQty > 0,
        label: currentQty > 0 ? 'In Stock' : 'Out of Stock',
        metaText: `₹${merged.price}`
      };
    });
  });

  product = computed(() => {
    const params = this.routeParams();
    const data = this.liveData();
    if (!params || !data) return undefined;

    const id = params.get('id');
    const type = params.get('type');
    
    return data.find(p => p.id === id && p.type === type) || null;
  });

  suggestions = computed(() => {
    const data = this.liveData();
    const currProduct = this.product();
    if (!data || !currProduct) return [];

    return data
      .filter(p => p.type === currProduct.type && p.id !== currProduct.id)
      .slice(0, 4);
  });

  goBack() {
    this.router.navigate(['/Products']);
  }

  viewProduct(p: any) {
    this.router.navigate(['/product-detail', p.type, p.id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  private tempInCartIds = signal<Set<string>>(new Set<string>());

  addToCart(product: any, qty = 1, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    // Add to cart
    this.cartService.addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.imageUrl,
      category: product.subtitle,
      type: product.type
    });
    // Temporary "In Cart" feedback for 1 second only
    this.showTemporaryInCart(product.id);
  }

  private showTemporaryInCart(id: string) {
    this.tempInCartIds.update(prev => {
      const updated = new Set(prev);
      updated.add(id);
      return updated;
    });

    setTimeout(() => {
      this.tempInCartIds.update(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    }, 1000);
  }

  // ONLY temporary state — ignores real cart (as per your requirement)
  isInCart(id: string): boolean {
    return this.tempInCartIds().has(id);
  }
  orderNow(product: any) {
    // Navigate straight to checkout with product specifics
    this.router.navigate(['/order-detail'], {
      queryParams: {
        id: product.id,
        type: product.type,
        title: product.title,
        price: product.price,
        image: product.imageUrl,
        qty: this.qty
      }
    });
  }
  
  toggleWishlist(product: any, event?: Event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    const numId = parseInt(product.id);
    if (this.wishlistService.isInWishlist(numId)) {
      this.wishlistService.removeByProductId(numId);
      this.inbox.logActivity('Wishlist', `Removed item from wishlist: ${product.title}`);
    } else {
      this.wishlistService.addItem({
        id: numId,
        name: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        category: product.subtitle
      } as WishlistItem);
      this.inbox.logActivity('Wishlist', `Added item to wishlist: ${product.title}`);
    }
  }

  isInWishlist(id: string) { return this.wishlistService.isInWishlist(parseInt(id)); }
}
