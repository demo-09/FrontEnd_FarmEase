import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../core/api.config';
import { AuthService } from '../core/services/auth.service';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // For Demo purposes, using a test key
  private razorpayKey = 'rzp_test_5yL7p3E9f0KqXN'; 

  initiatePayment(amount: number, orderDetails: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const currentUser = this.auth.currentUserValue;
      
      const options = {
        key: this.razorpayKey,
        amount: amount * 100, // Razorpay expects amount in paisa
        currency: 'INR',
        name: 'FarmEase',
        description: `Payment for Order #${orderDetails.id || 'New Order'}`,
        image: 'https://cdn-icons-png.flaticon.com/512/2969/2969371.png', // Logo
        handler: (response: any) => {
          // This callback is triggered on successful payment
          if (response.razorpay_payment_id) {
            resolve(response);
          } else {
            reject('Payment failed');
          }
        },
        prefill: {
          name: currentUser?.fullName || '',
          email: currentUser?.email || '',
          contact: currentUser?.phone || ''
        },
        notes: {
          address: currentUser?.address || ''
        },
        theme: {
          color: '#16a34a' // FarmEase Green
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    });
  }
}
