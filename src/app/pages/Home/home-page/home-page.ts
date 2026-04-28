import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AboutUsComponent } from '../about-us';
import { HeroSectionComponent } from '../hero-section.component';
import { FaqSectionComponent } from '../faq';
import { Services } from '../services';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, AboutUsComponent, HeroSectionComponent, Services, FaqSectionComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, public auth: AuthService) { }
  products = [
    {
      name: 'Organic Wheat Seeds',
      category: '🌾 Grains',
      img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
      price: '499',
      rating: '4.8',
      reviews: '142',
      badge: '🔥 Bestseller'
    },
    {
      name: 'Hybrid Tomato Seeds',
      category: '🍅 Vegetables',
      img: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?auto=format&fit=crop&q=80&w=400',
      price: '299',
      rating: '4.6',
      reviews: '98',
      badge: '🌱 Organic'
    },
    {
      name: 'Bio Compost Fertilizer',
      category: '♻️ Fertilizers',
      img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400',
      price: '649',
      rating: '4.9',
      reviews: '211',
      badge: '⭐ Top Rated'
    },
    {
      name: 'Drip Irrigation Kit',
      category: '💧 Equipment',
      img: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&q=80&w=400',
      price: '1,899',
      rating: '4.7',
      reviews: '67',
      badge: null
    },
    {
      name: 'Neem Pesticide Spray',
      category: '🌿 Organic',
      img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
      price: '349',
      rating: '4.5',
      reviews: '88',
      badge: '🌿 Eco-Safe'
    },
    {
      name: 'Basmati Rice (5kg)',
      category: '🍚 Grains',
      img: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=400',
      price: '799',
      rating: '4.8',
      reviews: '304',
      badge: '🔥 Popular'
    },
    {
      name: 'Solar Water Pump',
      category: '☀️ Equipment',
      img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400',
      price: '12,499',
      rating: '4.7',
      reviews: '43',
      badge: '♻️ Eco'
    },
    {
      name: 'Fresh Turmeric Powder',
      category: '🟡 Spices',
      img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=400',
      price: '189',
      rating: '4.9',
      reviews: '178',
      badge: '✅ Certified'
    }
  ];

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollReveal();
      this.initFilterButtons();
      this.initWishlistButtons();
    }
  }

  private initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.classList.contains('delay-0') ? 0
              : el.classList.contains('delay-1') ? 100
              : el.classList.contains('delay-2') ? 200
              : el.classList.contains('delay-3') ? 350
              : el.classList.contains('delay-4') ? 500
              : el.classList.contains('delay-5') ? 650
              : el.classList.contains('delay-6') ? 800
              : 0;
            setTimeout(() => el.classList.add('visible'), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(el => observer.observe(el));
  }

  private initFilterButtons() {
    document.querySelectorAll('.pf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pf-btn').forEach(b => b.classList.remove('pf-active'));
        btn.classList.add('pf-active');
      });
    });
  }

  private initWishlistButtons() {
    document.querySelectorAll('.pc-wishlist').forEach(btn => {
      btn.addEventListener('click', () => {
        const icon = btn.querySelector('i');
        if (icon) {
          if (icon.classList.contains('fa-regular')) {
            icon.classList.replace('fa-regular', 'fa-solid');
            (btn as HTMLElement).style.color = '#ef4444';
          } else {
            icon.classList.replace('fa-solid', 'fa-regular');
            (btn as HTMLElement).style.color = '';
          }
        }
      });
    });
  }
}
