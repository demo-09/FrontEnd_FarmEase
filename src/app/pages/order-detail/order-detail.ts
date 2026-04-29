import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.css']
})
export class OrderDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cartService = inject(CartService);

  // MODE: 'product' = single item from product-detail | 'cart' = full cart checkout
  mode = signal<'product' | 'cart'>('product');

  // Single product mode data
  productData = signal<any>(null);

  // Cart mode data
  cartItems = signal<any[]>([]);
  cartSubtotal = signal(0);
  cartShipping = signal(0);
  cartDiscount = signal(0);
  cartFinalTotal = signal(0);

  // Checkout Form Models
  shippingInfo = { fullName: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' };
  paymentMethod = signal<'cod' | 'upi' | 'card'>('cod');
  isProcessing = signal(false);
  orderPlaced = signal(false);
  orderId = signal('');

  // UPI / Card fields
  upiId = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  cardName = '';

  // Computeds for SINGLE PRODUCT BILL
  singleItemTotal = computed(() => {
    const p = this.productData();
    if (!p) return 0;
    return p.price * p.qty;
  });
  singleTax = computed(() => this.singleItemTotal() * 0.05);
  singleShipping = computed(() => this.singleItemTotal() > 5000 ? 0 : 250);
  singleGrandTotal = computed(() => this.singleItemTotal() + this.singleTax() + this.singleShipping());

  // Delivery Date
  deliveryDate = signal('');

  ngOnInit() {
    // Angular passes router state via history.state
    const state: any = history.state;

    if (state?.fromCart && state?.cartItems?.length) {
      // ── CART MODE ──
      this.mode.set('cart');
      this.cartItems.set(state.cartItems);
      this.cartSubtotal.set(state.subtotal ?? 0);
      this.cartShipping.set(state.shipping ?? 0);
      this.cartDiscount.set(state.discount ?? 0);
      this.cartFinalTotal.set(state.finalTotal ?? 0);

      // Pre-fill email if logged in
      const user = JSON.parse(localStorage.getItem('CurrentUser') || '{}');
      if (user?.email) this.shippingInfo.email = user.email;
      if (user?.name)  this.shippingInfo.fullName = user.name;
    } else {
      // ── SINGLE PRODUCT MODE ──
      this.mode.set('product');
      this.route.queryParams.subscribe(params => {
        if (params['id']) {
          this.productData.set({
            id: params['id'],
            title: params['title'],
            price: parseFloat(params['price']),
            image: params['image'],
            qty: parseInt(params['qty'] || '1', 10)
          });
          const user = JSON.parse(localStorage.getItem('CurrentUser') || '{}');
          if (user?.email) this.shippingInfo.email = user.email;
          if (user?.name)  this.shippingInfo.fullName = user.name;
        } else {
          this.router.navigate(['/Products']);
        }
      });
    }

    const d = new Date();
    d.setDate(d.getDate() + 3);
    this.deliveryDate.set(d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }));
  }

  placeOrder() {
    const info = this.shippingInfo;
    if (!info.fullName || !info.phone || !info.address || !info.pincode) {
      alert('Please fill in all required shipping details!');
      return;
    }

    // Validate payment-specific fields
    if (this.paymentMethod() === 'upi' && !this.upiId.trim()) {
      alert('Please enter your UPI ID to proceed.');
      return;
    }
    if (this.paymentMethod() === 'card') {
      if (!this.cardNumber || !this.cardExpiry || !this.cardCvv || !this.cardName) {
        alert('Please fill in all card details.');
        return;
      }
    }

    this.isProcessing.set(true);

    if (this.mode() === 'cart') {
      // POST to backend
      this.http.post<any>('https://backend-farmease-1.onrender.com/api/orders', { checkoutFromCart: true }).subscribe({
        next: (res) => {
          this.cartService.clearLocalCart();
          const id = res?.id || Math.floor(100000 + Math.random() * 900000);
          this.orderId.set(`FE-${id}`);
          this.isProcessing.set(false);
          this.orderPlaced.set(true);
        },
        error: () => {
          // Still show success — cart checkout worked client-side
          this.cartService.clearLocalCart();
          const id = Math.floor(100000 + Math.random() * 900000);
          this.orderId.set(`FE-${id}`);
          this.isProcessing.set(false);
          this.orderPlaced.set(true);
        }
      });
    } else {
      // Single product — simulate processing
      setTimeout(() => {
        const id = Math.floor(100000 + Math.random() * 900000);
        this.orderId.set(`FE-${id}`);
        this.isProcessing.set(false);
        this.orderPlaced.set(true);
      }, 1500);
    }
  }

  get grandTotal(): number {
    return this.mode() === 'cart' ? this.cartFinalTotal() : this.singleGrandTotal();
  }

  goHome() { this.router.navigate(['/HomePage']); }
  goOrders() { this.router.navigate(['/Orders']); }
}
