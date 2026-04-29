import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, CommonModule],
  standalone: true,
  template: `
<section class="hero-section">

  <!-- Animated Gradient Background -->
  <div class="hero-bg-gradient"></div>
  <div class="hero-bg-mesh"></div>

  <!-- Floating Particles -->
  <div class="particles">
    <div class="particle"></div><div class="particle"></div>
    <div class="particle"></div><div class="particle"></div>
    <div class="particle"></div><div class="particle"></div>
    <div class="particle"></div><div class="particle"></div>
    <div class="particle"></div><div class="particle"></div>
  </div>

  <!-- Floating Agri Shapes -->
  <div class="floating-shapes" aria-hidden="true">
    <div class="shape shape-1">🌾</div>
    <div class="shape shape-2">🍃</div>
    <div class="shape shape-3">🌱</div>
    <div class="shape shape-4">🌿</div>
    <div class="shape shape-5">🌻</div>
    <div class="shape shape-6">🍀</div>
  </div>

  <!-- Main Hero Content -->
  <div class="container hero-container">
    <div class="row align-items-center g-5">

      <!-- LEFT: Text Content -->
      <div class="col-lg-6">
        <div class="hero-content">

          <div class="hero-badge anim-fade-up delay-0">
            <span class="live-dot"></span>
            🚀 Future of Agriculture is Here
          </div>

          <h1 class="hero-title anim-fade-up delay-1">
            <span class="hero-title-light">Empowering</span>
            <span class="hero-title-gradient"> Farmers.</span><br>
            <span class="hero-title-light">Connecting</span>
            <span class="hero-title-gradient"> Markets.</span>
          </h1>

          <p class="hero-subtitle anim-fade-up delay-2">
            FarmEase is India's next-generation agricultural marketplace — connecting <strong>10,000+ farmers</strong>, customers, and service providers with AI-powered insights, direct trade, and smart farming tools.
          </p>

          <!-- CTA Buttons -->
          <div class="hero-ctas anim-fade-up delay-3">
            <button routerLink="/Products" class="btn-hero-primary" id="hero-explore-btn">
              <i class="fa-solid fa-store"></i>
              Explore Marketplace
            </button>
          </div>

          <!-- Live Stats -->
          <div class="hero-stats anim-fade-up delay-4">
            <div class="hero-stat">
              <span class="hero-stat-num">10K+</span>
              <span class="hero-stat-label">Farmers</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-num">50K+</span>
              <span class="hero-stat-label">Products</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-num">28</span>
              <span class="hero-stat-label">States</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-num">₹2Cr+</span>
              <span class="hero-stat-label">Trade</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Visual Card -->
      <div class="col-lg-6">
        <div class="hero-visual anim-slide-right delay-2">

          <!-- Main Image Glass Card -->
          <div class="hero-img-card anim-float">
            <div class="hero-img-inner">
              <img
                src="../../../assets/images/logo.png"
                alt="Smart Farming"
                class="hero-main-img"
                loading="eager"
              />
            </div>
          </div>

          <!-- Floating Info Cards -->
          <div class="floating-card fc-1 anim-float-slow">
            <div class="fc-icon">🌦️</div>
            <div>
              <div class="fc-title">Today's Weather</div>
              <div class="fc-val">28°C · Partly Cloudy</div>
            </div>
          </div>

          <div class="floating-card fc-2 anim-float">
            <div class="fc-icon">📦</div>
            <div>
              <div class="fc-title">Orders Today</div>
              <div class="fc-val text-success fw-bold">+342 shipped</div>
            </div>
          </div>

          <div class="floating-card fc-3 anim-float-slow" style="animation-delay:1.5s">
            <div class="fc-icon">💰</div>
            <div>
              <div class="fc-title">Avg. Farmer Profit</div>
              <div class="fc-val text-success fw-bold">+23% this season</div>
            </div>
          </div>

          <!-- Orbs -->
          <div class="hero-orb orb-green"></div>
          <div class="hero-orb orb-yellow"></div>
        </div>
      </div>

    </div>
  </div>


</section>
  `,
  styles: [`

/* ══════════════════ HERO SECTION ══════════════════ */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  overflow: hidden;
}

/* Animated backgrounds */
.hero-bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(140deg,
    #f0fdf4 0%,
    #dcfce7 25%,
    #f9fafb 50%,
    #ecfdf5 75%,
    #f0fdf4 100%);
  background-size: 400% 400%;
  animation: gradientMove 12s ease infinite;
  z-index: 0;
}
@keyframes gradientMove {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
.hero-bg-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 60% at 15% 20%, rgba(34,197,94,0.14) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 85% 80%, rgba(10,61,32,0.10) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 70% 10%, rgba(250,204,21,0.07) 0%, transparent 50%);
  z-index: 0;
}

/* Floating shapes */
.floating-shapes { position: absolute; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; }
.shape {
  position: absolute;
  font-size: 2rem;
  opacity: 0.25;
  animation: floatSlow 8s ease-in-out infinite;
}
@keyframes floatSlow {
  0%,100% { transform: translateY(0) rotate(0deg); }
  50%     { transform: translateY(-20px) rotate(8deg); }
}
.shape-1 { top: 10%; left: 5%;  font-size: 2.2rem; animation-delay: 0s;   }
.shape-2 { top: 20%; right: 8%; font-size: 1.8rem; animation-delay: 1.5s; }
.shape-3 { top: 60%; left: 3%;  font-size: 1.6rem; animation-delay: 3s;   }
.shape-4 { top: 75%; right: 5%; font-size: 2rem;   animation-delay: 2s;   }
.shape-5 { top: 40%; left: 48%; font-size: 1.4rem; animation-delay: 4s;   }
.shape-6 { top: 85%; left: 20%; font-size: 1.5rem; animation-delay: 1s;   }

.hero-container {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 40px;
}

/* ── Hero Content ── */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(198, 255, 219, 0.8);
  border-radius: 999px;
  padding: 8px 20px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #166534;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(34,197,94,0.12);
}
.live-dot {
  width: 8px; height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(34,197,94,0.25);
  animation: pulse-live 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse-live {
  0%,100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
  50%     { box-shadow: 0 0 0 6px rgba(34,197,94,0.05); }
}

.hero-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}
.hero-title-light    { color: #0a3d20; }
.hero-title-gradient {
  background: linear-gradient(135deg, #16a34a, #22c55e, #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.08rem;
  color: #4b5563;
  line-height: 1.8;
  margin-bottom: 36px;
  max-width: 540px;
}

/* CTA Buttons */
.hero-ctas {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 44px;
}
.btn-hero-primary {
  background: linear-gradient(135deg, #22c55e, #16a34a, #0f5132);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 15px 36px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 6px 28px rgba(34,197,94,0.35);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}
.btn-hero-primary::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transition: left 0.5s ease;
}
.btn-hero-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 44px rgba(34,197,94,0.5);
}
.btn-hero-primary:hover::before { left: 100%; }

.btn-hero-outline {
  background: rgba(255,255,255,0.85);
  color: #166534;
  border: 2px solid rgba(34,197,94,0.4);
  border-radius: 999px;
  padding: 14px 34px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(8px);
}
.btn-hero-outline:hover {
  background: #16a34a;
  color: #fff;
  border-color: #16a34a;
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(34,197,94,0.35);
}

/* Stats Row */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.hero-stat { text-align: center; }
.hero-stat-num {
  display: block;
  font-family: 'Poppins', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0a3d20;
  line-height: 1;
}
.hero-stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7280;
  margin-top: 4px;
}
.hero-stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(22,163,74,0.25);
}

/* ── Hero Visual (Right Side) ── */
.hero-visual { position: relative; padding: 40px; }

.hero-img-card {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(10,61,32,0.18), 0 8px 32px rgba(34,197,94,0.12);
  overflow: hidden;
  position: relative;
}
.hero-img-inner { position: relative; }
.hero-main-img {
  width: 100%;
  height: 360px;
  object-fit: cover;
  display: block;
  border-radius: 22px;
  padding: 8px;
}
.hero-img-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
}
.hero-tag-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 12px 18px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: 1px solid rgba(34,197,94,0.2);
}
.tag-title { font-size: 0.72rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; }
.tag-sub   { font-size: 0.88rem; color: #6b7280; }

/* Floating info cards */
.floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 18px;
  padding: 12px 18px;
  box-shadow: 0 8px 32px rgba(10,61,32,0.12);
  white-space: nowrap;
  z-index: 5;
  animation: floatSlow 6s ease-in-out infinite;
}
.fc-icon  { font-size: 1.5rem; }
.fc-title { font-size: 0.7rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
.fc-val   { font-size: 0.88rem; font-weight: 600; color: #1f2937; }
.fc-1 { top: -10px;  left: -30px; }
.fc-2 { top: 30px;   right: -30px; animation-delay: 1s; }
.fc-3 { bottom: 40px; left: -25px; }

/* Orbs */
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); z-index: 0; pointer-events: none; }
.orb-green  { width: 280px; height: 280px; background: rgba(34,197,94,0.18); top: -60px; right: -60px; }
.orb-yellow { width: 200px; height: 200px; background: rgba(250,204,21,0.15); bottom: -40px; left: -40px; }

/* ── Trust Bar ── */
.hero-trust-bar {
  position: relative;
  z-index: 3;
  background: rgba(10,61,32,0.92);
  backdrop-filter: blur(20px);
  margin-top: 20px;
  padding: 18px 0;
}
.trust-inner {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;
}
.trust-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}
.trust-logos { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
.trust-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  white-space: nowrap;
}
.trust-item i { color: #4ade80; }

/* ── Float animation (local) ── */
@keyframes anim-float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)} }
.anim-float     { animation: anim-float 4s ease-in-out infinite; }
.anim-float-slow { animation: anim-float 7s ease-in-out infinite; }

/* ── Responsive ── */
@media (max-width: 991px) {
  .hero-section { padding-top: 70px; }
  .hero-container { padding-top: 20px; padding-bottom: 20px; }
  .hero-visual { display: none; }
  .hero-title { font-size: 2.2rem; }
  .hero-ctas { justify-content: center; }
  .hero-stats { justify-content: center; }
  .hero-content { text-align: center; }
  .hero-subtitle { margin: 0 auto 32px; }
}
@media (max-width: 576px) {
  .btn-hero-primary, .btn-hero-outline { padding: 12px 24px; font-size: 0.88rem; }
  .hero-stat-num { font-size: 1.3rem; }
  .trust-logos { gap: 14px; }
}
  `]
})
export class HeroSectionComponent {}
