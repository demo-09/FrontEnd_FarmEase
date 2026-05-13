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
  supportPhone = '9327333522';
  supportEmail = 'ujjavalkarangiya24@gmail.com';

  getWhatsAppLink(): string {
    const text = encodeURIComponent(`Hello FarmEase Support, I need some help!`);
    return `https://wa.me/${this.supportPhone}?text=${text}`;
  }

  getPhoneLink(): string {
    return `tel:+91${this.supportPhone}`;
  }

  getMailLink(): string {
    const subject = encodeURIComponent(`FarmEase Support Request`);
    const body = encodeURIComponent(`Hi Support Team,\n\nI have a question regarding...`);
    return `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
  }

  submitMessage(event: Event) {
    event.preventDefault();
    alert('✅ Message sent to FarmEase support!');
  }
}
