import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<section class="faq-section">
  <div class="container">

    <div class="faq-layout">

      <!-- Left: Header + CTA -->
      <div class="faq-left reveal">
        <span class="faq-label">❓ FAQ</span>
        <h2 class="faq-title">Common <span>Questions</span></h2>
        <p class="faq-desc">Everything you need to know about FarmEase. Can't find your answer? Talk to our support team.</p>
        <a routerLink="/ai" class="faq-contact-btn">
          <i class="fa-solid fa-headset"></i> Chat With Us
        </a>
        <div class="faq-contact-info">
          <div class="fci-item">
            <i class="fa-solid fa-envelope"></i>
            <span>support@farmease.in</span>
          </div>
          <div class="fci-item">
            <i class="fa-solid fa-phone"></i>
            <span>1800-FARMEASE (Free)</span>
          </div>
        </div>
      </div>

      <!-- Right: Accordion -->
      <div class="faq-right">
        <div *ngFor="let faq of faqs; let i = index" class="faq-item reveal" [style.animation-delay]="i * 0.08 + 's'">
          <input type="checkbox" [id]="'faq-' + i" class="faq-toggle">
          <label [for]="'faq-' + i" class="faq-header">
            <div class="faq-q-icon"><i class="fa-solid fa-circle-question"></i></div>
            <span class="faq-question">{{ faq.question }}</span>
            <div class="faq-toggle-icon">
              <i class="fa-solid fa-chevron-down"></i>
            </div>
          </label>
          <div class="faq-body">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
  `,
  styles: [`
.faq-section {
  padding: 100px 0;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
}
.faq-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 60px;
  align-items: start;
}
.faq-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #16a34a;
  margin-bottom: 14px;
}
.faq-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 800;
  color: #0a3d20;
  margin-bottom: 16px;
  line-height: 1.2;
}
.faq-title span {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.faq-desc { font-size: 0.95rem; color: #6b7280; line-height: 1.75; margin-bottom: 28px; }
.faq-contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 12px 28px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.35s ease;
  text-decoration: none;
  box-shadow: 0 4px 18px rgba(34,197,94,0.3);
  margin-bottom: 24px;
}
.faq-contact-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(34,197,94,0.45);
  color: #fff;
}
.faq-contact-info { display: flex; flex-direction: column; gap: 10px; }
.fci-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #6b7280;
}
.fci-item i { color: #16a34a; width: 16px; }

/* Accordion */
.faq-right { display: flex; flex-direction: column; gap: 14px; }
.faq-item { position: relative; }
.faq-toggle { display: none; }
.faq-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
  background: rgba(255,255,255,0.9);
  border: 1.5px solid rgba(34,197,94,0.12);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.35s ease;
  box-shadow: 0 2px 12px rgba(10,61,32,0.05);
  user-select: none;
}
.faq-header:hover {
  background: rgba(255,255,255,1);
  border-color: rgba(34,197,94,0.28);
  box-shadow: 0 6px 24px rgba(10,61,32,0.1);
  transform: translateX(4px);
}
.faq-q-icon {
  width: 36px; height: 36px;
  background: rgba(34,197,94,0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.faq-toggle:checked ~ .faq-header .faq-q-icon {
  background: #16a34a;
  color: #fff;
}
.faq-question {
  flex: 1;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0a3d20;
}
.faq-toggle-icon {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(34,197,94,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  flex-shrink: 0;
  font-size: 0.75rem;
  transition: all 0.4s ease;
}
.faq-toggle:checked ~ .faq-header .faq-toggle-icon {
  background: #16a34a;
  color: #fff;
  transform: rotate(180deg);
}
.faq-toggle:checked ~ .faq-header {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-color: transparent;
  background: linear-gradient(135deg, rgba(34,197,94,0.05), rgba(22,163,74,0.08));
}
.faq-body {
  background: rgba(255,255,255,0.95);
  border: 1.5px solid rgba(34,197,94,0.15);
  border-top: none;
  border-radius: 0 0 18px 18px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
  opacity: 0;
}
.faq-toggle:checked ~ .faq-body {
  max-height: 220px;
  opacity: 1;
}
.faq-body p {
  padding: 18px 24px 22px 76px;
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.75;
  margin: 0;
}

/* Reveal */
.reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.75s ease, transform 0.75s cubic-bezier(0.22,1,0.36,1); }
.reveal.visible { opacity: 1; transform: translateY(0); }

@media (max-width: 991px) {
  .faq-layout { grid-template-columns: 1fr; gap: 40px; }
  .faq-section { padding: 70px 0; }
  .faq-left { text-align: center; }
  .faq-contact-info { align-items: center; }
}
  `]
})
export class FaqSectionComponent {
  faqs = [
    {
      question: 'What makes FarmEase different from other agri platforms?',
      answer: 'FarmEase combines an AI-powered marketplace, real-time weather insights, direct farmer-to-buyer trade, and smart inventory management in a single beautifully designed platform — purpose-built for Indian agriculture.'
    },
    {
      question: 'How does the direct marketplace work?',
      answer: 'Farmers list their produce with photos, pricing, and availability. Customers browse, compare, and buy directly. FarmEase handles secure payment processing and order coordination, eliminating unnecessary middlemen.'
    },
    {
      question: 'Is the AI crop suggestion feature available for free?',
      answer: 'Yes! Our basic AI crop recommendation tool is free for all registered farmers. Premium subscribers get deep soil analysis, satellite imagery insights, and personalized seasonal planning.'
    },
    {
      question: 'Can I sell machinery and equipment on FarmEase?',
      answer: 'Absolutely. Our marketplace features a dedicated section for agricultural machinery, irrigation tools, and farming equipment. Verified service providers can list both sales and rental offerings.'
    },
    {
      question: 'How are payments processed and when do farmers get paid?',
      answer: 'We use bank-grade security for all transactions. Farmers receive payment within 24-48 hours of order confirmation via bank transfer or UPI — with zero hidden charges on the basic plan.'
    },
    {
      question: 'Is FarmEase available across all of India?',
      answer: 'FarmEase currently operates in 28 states and union territories. We are expanding delivery networks to cover all pin codes. Farmers can list products from anywhere in India.'
    }
  ];
}
