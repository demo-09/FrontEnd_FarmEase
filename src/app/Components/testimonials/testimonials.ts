import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule,FormsModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
})
export class Testimonials {
 items:any[]= ['Ujjaval Karangiya', 'Bhavin Prajapati', 'Krish Patel', 'Mahir Gandhi', 'Jayraj Gohil', 'Naval Zala', 'Karan Kalaria'];
}
