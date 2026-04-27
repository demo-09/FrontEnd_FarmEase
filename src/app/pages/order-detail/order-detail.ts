import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

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

  productData = signal<any>(null);

  shippingInfo = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  };

  paymentMethod = signal<'cod' | 'upi' | 'card'>('cod');
  isProcessing = signal(false);
  deliveryDate = signal('');

  // 💰 BILL
  totalCost = computed(() => {
    const p = this.productData();
    return p ? p.price * p.qty : 0;
  });

  tax = computed(() => this.totalCost() * 0.05);
  shippingFee = computed(() => this.totalCost() > 5000 ? 0 : 250);
  grandTotal = computed(() => this.totalCost() + this.tax() + this.shippingFee());

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.productData.set({
          id: params['id'],
          title: params['title'],
          price: parseFloat(params['price']),
          image: params['image'],
          qty: parseInt(params['qty'] || '1', 10)
        });
      } else {
        this.router.navigate(['/Products']);
      }
    });

    const d = new Date();
    d.setDate(d.getDate() + 3);
    this.deliveryDate.set(
      d.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    );
  }

  // 🚀 ORDER
  placeOrder() {
    if (!this.shippingInfo.fullName || !this.shippingInfo.phone || !this.shippingInfo.address || !this.shippingInfo.pincode) {
      alert('Please complete required fields!');
      return;
    }

    this.isProcessing.set(true);

    setTimeout(() => {
      this.isProcessing.set(false);

      const modalEl = document.getElementById('orderSuccessModal');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }

    }, 1500);
  }

  goHome() {
    this.router.navigate(['/HomePage']);
  }
}
