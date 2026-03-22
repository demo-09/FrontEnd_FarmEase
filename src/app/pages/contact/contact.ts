import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {
  
  // Hardcoded Support/Contact details
  supportPhone = '919876543210';
  supportEmail = 'support@farmease.in';

  getWhatsAppLink(): string {
    const text = encodeURIComponent(`Hello FarmEase Support, I need some help!`);
    return `https://wa.me/9327333522?text=${text}`;
  }

  getPhoneLink(): string {
    return `tel:+919327333522`;
  }

  getMailLink(): string {
    const subject = encodeURIComponent(`FarmEase Support Request`);
    const body = encodeURIComponent(`Hi Support Team,\n\nI have a question regarding...`);
    return `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
  }

  getVideoCallLink(): string {
    // Generalized video meeting fallback link
    return 'https://meet.google.com/new'; 
  }

  submitMessage(event: Event) {
    event.preventDefault();
    alert('✅ Message sent to FarmEase support!');
  }
}
