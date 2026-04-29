import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { AdminInboxService } from '../../services/admin-inbox.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {
  private cartService = inject(CartService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private adminInbox = inject(AdminInboxService);

  cartItems = this.cartService.items;
  subtotal  = this.cartService.subtotal;

  showToast = false;
  toastMessage = '';

  get shipping(): number { return this.cartService.count() > 0 ? 99 : 0; }
  get total():    number { return this.subtotal() + this.shipping; }
  get discount(): number { return Math.round(this.subtotal() * 0.05); }
  get finalTotal(): number { return this.total - this.discount; }

  updateQty(id: number, delta: number) { this.cartService.updateQty(id, delta); }

  removeItem(id: number) {
    this.cartService.removeItem(id);
    this.notify('Item removed from cart');
  }

  clearCart() {
    this.cartService.clearCart();
    this.notify('Cart cleared');
  }

  placeOrder() {
    if (this.cartService.count() === 0) return;

    // Navigate to order-detail with cart state
    this.router.navigate(['/order-detail'], {
      state: {
        fromCart: true,
        cartItems: this.cartItems(),
        subtotal: this.subtotal(),
        shipping: this.shipping,
        discount: this.discount,
        finalTotal: this.finalTotal
      }
    });
  }

  private notify(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 2800);
  }

  ngOnInit(): void {}
}
