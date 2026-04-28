import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../services/cart.service';
import { WishlistService } from '../../../pages/wishlist/wishlist';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {
  isScrolled = false;
  currentUser: any = null;
  private routerSub!: Subscription;

  private router = inject(Router);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);

  cartCount = this.cartService.count;
  wishCount = this.wishlistService.count;

  @HostListener('window:scroll')
  onScroll() { this.isScrolled = window.scrollY > 20; }

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.updateUser();
    this.routerSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => this.updateUser());
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
  }
  // in your component
  ngAfterViewInit() {
    const el = document.getElementById('mobileNav');
    if (el) {
      el.addEventListener('click', () => {
        const bsCollapse = (window as any).bootstrap?.Collapse;
        if (bsCollapse) {
          const instance = bsCollapse.getInstance(el);
          if (instance) instance.hide();
        }
      });
    }
  }
  updateUser() {
    const storedData = localStorage.getItem('CurrentUser');
    try {
      this.currentUser = storedData ? JSON.parse(storedData) : null;
    } catch (e) {
      this.currentUser = null;
    }
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  logout(): void {
    localStorage.removeItem('CurrentUser');
    this.auth.logout();
    this.cartService.clearLocalCart();
    this.wishlistService.clearLocalWishlist();
    this.currentUser = null;
    this.router.navigate(['/Login']);
  }
}
