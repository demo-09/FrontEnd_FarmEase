import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { API_URL } from '../../core/api.config';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { PaymentService } from '../../services/payment.service';

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
  private paymentService = inject(PaymentService);

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
      if (user?.fullName) this.shippingInfo.fullName = user.fullName;
    } else {
      // ── SINGLE PRODUCT MODE ──
      this.mode.set('product');
      this.route.queryParams.subscribe(params => {
        if (params['id']) {
          this.productData.set({
            id: params['id'],
            type: params['type'],
            title: params['title'],
            price: parseFloat(params['price']),
            image: params['image'],
            qty: parseInt(params['qty'] || '1', 10)
          });
          const user = JSON.parse(localStorage.getItem('CurrentUser') || '{}');
          if (user?.email) this.shippingInfo.email = user.email;
          if (user?.fullName) this.shippingInfo.fullName = user.fullName;
        } else {
          this.router.navigate(['/Products']);
        }
      });
    }

    const d = new Date();
    d.setDate(d.getDate() + 3);
    this.deliveryDate.set(d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }));
  }

  async placeOrder() {
    const info = this.shippingInfo;
    if (!info.fullName || !info.phone || !info.address || !info.pincode) {
      alert('Please fill in all required shipping details!');
      return;
    }

    this.isProcessing.set(true);

    let transactionId = 'COD';

    // TRIGGER PAYMENT GATEWAY IF NOT COD
    if (this.paymentMethod() !== 'cod') {
      try {
        const paymentResponse = await this.paymentService.initiatePayment(this.grandTotal, { id: 'NEW' });
        transactionId = paymentResponse.razorpay_payment_id;
        console.log('[PAYMENT] Success. Txn ID:', transactionId);
      } catch (err) {
        console.error('[PAYMENT FAILED]', err);
        this.isProcessing.set(false);
        return; // Stop checkout if payment fails
      }
    }

    console.log('[ORDER] Placing order. Mode:', this.mode());

    const payload: any = {
      checkoutFromCart: this.mode() === 'cart',
      transactionId: transactionId,
      shippingAddress: `${info.address}, ${info.city}, ${info.state} - ${info.pincode}`
    };

    if (this.mode() === 'product') {
      const p = this.productData();
      payload.items = [{
        productId: parseInt(p.id),
        productName: p.title,
        price: p.price,
        quantity: p.qty,
        imageUrl: p.image,
        productType: p.type
      }];
    }

    this.http.post<any>(`${API_URL}/orders`, payload).subscribe({
      next: (res) => {
        if (this.mode() === 'cart') this.cartService.clearLocalCart();
        const id = res?.id || Math.floor(100000 + Math.random() * 900000);
        this.orderId.set(`FE-${id}`);
        this.isProcessing.set(false);
        this.orderPlaced.set(true);
      },
      error: (err) => {
        console.error('[ORDER ERROR]', err);
        alert(`Order failed: ${err.error?.message || 'Server error'}`);
        this.isProcessing.set(false);
      }
    });
  }

  get grandTotal(): number {
    return this.mode() === 'cart' ? this.cartFinalTotal() : this.singleGrandTotal();
  }

  goHome() { this.router.navigate(['/home']); }
  goOrders() { this.router.navigate(['/orders']); }
}
