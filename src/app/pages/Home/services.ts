import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  template: `
<section class="services-section">
  <div class="container">

    <div class="section-header reveal">
      <div class="svc-header-inner">
        <div>
          <span class="svc-label">⚡ Platform Features</span>
          <h2 class="svc-title">Smart Tools for <span>Modern Agriculture</span></h2>
          <p class="svc-desc">Leverage cutting-edge technology to transform every aspect of your farm business.</p>
        </div>
        <div class="svc-header-badge">
          <div class="shb-num">6+</div>
          <div class="shb-text">Core Features</div>
        </div>
      </div>
    </div>

    <div class="services-bento">
      <div class="svc-card svc-card-wide reveal delay-0" *ngFor="let f of features.slice(0,1)">
        <div class="svc-icon-orb svc-icon-green">
          <i [class]="'fa-solid fa-2x ' + f.icon"></i>
        </div>
        <div class="svc-content">
          <h3 class="svc-name">{{ f.title }}</h3>
          <p class="svc-text">{{ f.desc }}</p>
          <div class="svc-tags">
            <span class="svc-tag" *ngFor="let t of f.tags">{{ t }}</span>
          </div>
        </div>
        <div class="svc-card-number">01</div>
      </div>

      <div class="svc-card reveal delay-1" *ngFor="let f of features.slice(1,3); let i = index">
        <div class="svc-icon-orb" [class]="i === 0 ? 'svc-icon-amber' : 'svc-icon-green'">
          <i [class]="'fa-solid fa-xl ' + f.icon"></i>
        </div>
        <h3 class="svc-name">{{ f.title }}</h3>
        <p class="svc-text">{{ f.desc }}</p>
        <div class="svc-card-number">0{{ i+2 }}</div>
      </div>

      <div class="svc-card svc-card-dark reveal delay-3" *ngFor="let f of features.slice(3,4)">
        <div class="svc-icon-orb svc-icon-light">
          <i [class]="'fa-solid fa-xl ' + f.icon"></i>
        </div>
        <h3 class="svc-name-light">{{ f.title }}</h3>
        <p class="svc-text-light">{{ f.desc }}</p>
        <div class="svc-card-number svc-num-light">04</div>
      </div>

      <div class="svc-card reveal delay-4" *ngFor="let f of features.slice(4,5)">
        <div class="svc-icon-orb svc-icon-pink">
          <i [class]="'fa-solid fa-xl ' + f.icon"></i>
        </div>
        <h3 class="svc-name">{{ f.title }}</h3>
        <p class="svc-text">{{ f.desc }}</p>
        <div class="svc-card-number">05</div>
      </div>

      <div class="svc-card svc-card-green-alt reveal delay-5" *ngFor="let f of features.slice(5,6)">
        <div class="svc-icon-orb svc-icon-white">
          <i [class]="'fa-solid fa-xl ' + f.icon"></i>
        </div>
        <h3 class="svc-name">{{ f.title }}</h3>
        <p class="svc-text">{{ f.desc }}</p>
        <div class="svc-card-number">06</div>
      </div>
    </div>
  </div>
</section>
  `,
  styles: [`
.services-section {
  padding: 100px 0;
  background: #f9fafb;
}
/* Header */
.svc-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #16a34a;
  margin-bottom: 14px;
}
.svc-header-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.svc-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 800;
  color: #0a3d20;
  margin-bottom: 12px;
  line-height: 1.2;
}
.svc-title span {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.svc-desc { font-size: 1rem; color: #6b7280; max-width: 500px; line-height: 1.7; }
.svc-header-badge {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 20px;
  padding: 20px 28px;
  text-align: center;
  box-shadow: 0 8px 28px rgba(34,197,94,0.3);
  flex-shrink: 0;
}
.shb-num  { font-family: 'Poppins',sans-serif; font-size: 2rem; font-weight: 900; color: #fff; }
.shb-text { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.08em; }

/* Bento Grid */
.services-bento {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  margin-top: 48px;
}
.svc-card {
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(34,197,94,0.1);
  border-radius: 26px;
  padding: 36px 30px;
  box-shadow: 0 4px 24px rgba(10,61,32,0.06);
  transition: all 0.4s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.svc-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 24px 60px rgba(10,61,32,0.14);
  border-color: rgba(34,197,94,0.28);
}
.svc-card-wide {
  grid-column: span 1;
  display: flex;
  align-items: flex-start;
  gap: 24px;
}
.svc-card-dark {
  background: linear-gradient(145deg, #0a3d20, #166534);
  border-color: rgba(74,222,128,0.2);
}
.svc-card-dark:hover { border-color: rgba(74,222,128,0.4); }
.svc-card-green-alt {
  background: linear-gradient(145deg, #f0fdf4, #dcfce7);
  border-color: rgba(34,197,94,0.2);
}

/* Icon Orbs */
.svc-icon-orb {
  width: 68px; height: 68px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 20px;
  transition: all 0.35s ease;
}
.svc-card-wide .svc-icon-orb { margin-bottom: 0; }
.svc-card:hover .svc-icon-orb { transform: rotate(8deg) scale(1.1); }
.svc-icon-green  { background: rgba(34,197,94,0.12); color: #16a34a; }
.svc-icon-amber  { background: rgba(250,204,21,0.12); color: #d97706; }
.svc-icon-pink   { background: rgba(236,72,153,0.1);  color: #be185d; }
.svc-icon-light  { background: rgba(255,255,255,0.15); color: #4ade80; }
.svc-icon-white  { background: rgba(34,197,94,0.15);   color: #16a34a; }

.svc-content { flex: 1; }
.svc-name   { font-family: 'Poppins',sans-serif; font-size: 1.1rem; font-weight: 800; color: #0a3d20; margin-bottom: 10px; }
.svc-text   { font-size: 0.87rem; color: #6b7280; line-height: 1.7; margin-bottom: 14px; }
.svc-name-light { font-family: 'Poppins',sans-serif; font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 10px; }
.svc-text-light { font-size: 0.87rem; color: rgba(255,255,255,0.7); line-height: 1.7; }
.svc-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.svc-tag {
  font-size: 0.7rem; font-weight: 700;
  background: rgba(34,197,94,0.1);
  color: #166534;
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 999px;
  padding: 3px 12px;
}
.svc-card-number {
  position: absolute;
  bottom: 20px; right: 24px;
  font-family: 'Poppins',sans-serif;
  font-size: 3.5rem;
  font-weight: 900;
  color: rgba(10,61,32,0.05);
  line-height: 1;
  user-select: none;
}
.svc-num-light { color: rgba(255,255,255,0.08); }

/* Section header reveal */
.section-header { margin-bottom: 0; }
.reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.75s ease, transform 0.75s cubic-bezier(0.22,1,0.36,1); }
.reveal.visible { opacity: 1; transform: translateY(0); }

@media (max-width: 991px) {
  .services-bento { grid-template-columns: 1fr 1fr; }
  .svc-card-wide { grid-column: span 2; }
  .services-section { padding: 70px 0; }
}
@media (max-width: 576px) {
  .services-bento { grid-template-columns: 1fr; }
  .svc-card-wide  { grid-column: span 1; flex-direction: column; }
  .svc-header-badge { display: none; }
}
  `]
})
export class Services {
  features = [
    {
      icon: 'fa-microchip',
      title: 'Smart Farming Tools',
      desc: 'Advanced IoT sensors, telemetry, and real-time monitoring for soil health, moisture, and crop vitals — all from your phone.',
      tags: ['IoT', 'Real-time', 'Mobile']
    },
    {
      icon: 'fa-shop',
      title: 'Online Marketplace',
      desc: 'Buy and sell agricultural products directly without middlemen, ensuring better prices for both farmers and buyers.'
    },
    {
      icon: 'fa-brain',
      title: 'AI Crop Suggestions',
      desc: 'Intelligent crop rotation, soil analysis, and deep learning recommendations to maximize your seasonal yield.'
    },
    {
      icon: 'fa-truck-fast',
      title: 'Live Order Tracking',
      desc: 'Real-time delivery tracking with automatic notifications — from farm pickup to doorstep delivery, always updated.'
    },
    {
      icon: 'fa-cloud-sun-rain',
      title: 'Weather Insights',
      desc: 'Hyper-local forecasts with 15-day planning views, rainfall predictions, and irrigation schedule recommendations.'
    },
    {
      icon: 'fa-shield-halved',
      title: 'Secure Payments',
      desc: 'Military-grade encrypted transactions with instant farmer payouts, dispute resolution, and transparent fee structure.'
    }
  ];
}
