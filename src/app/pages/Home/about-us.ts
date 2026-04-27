import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [RouterLink],
  template: `
<section class="about-section">
  <div class="container">

    <!-- Header -->
    <div class="row align-items-center mb-5 g-5">
      <div class="col-lg-6 reveal">
        <span class="about-label">🌿 Our Mission</span>
        <h2 class="about-title">
          Bridging the Gap Between<br>
          <span class="about-highlight">Farm &amp; Market</span>
        </h2>
        <p class="about-desc">
          FarmEase was born from a simple belief: <strong>every farmer deserves a fair price</strong>, and every customer deserves <strong>food they can trust</strong>. We are building India's most comprehensive agricultural ecosystem — powered by technology, driven by humans.
        </p>

        <!-- Mission Points -->
        <div class="about-points">
          <div class="about-point">
            <div class="ap-icon">🚜</div>
            <div>
              <div class="ap-title">Empower Farmers</div>
              <div class="ap-desc">Direct market access, AI insights, and fair pricing for every grower.</div>
            </div>
          </div>
          <div class="about-point">
            <div class="ap-icon">🌾</div>
            <div>
              <div class="ap-title">Fresh for Everyone</div>
              <div class="ap-desc">Source-verified, chemical-free produce from farm to your doorstep.</div>
            </div>
          </div>
          <div class="about-point">
            <div class="ap-icon">📱</div>
            <div>
              <div class="ap-title">Digital Agriculture</div>
              <div class="ap-desc">Transforming traditional farming with data, AI, and mobile-first tools.</div>
            </div>
          </div>
        </div>

        <a routerLink="/About" class="about-btn">
          <i class="fa-solid fa-arrow-right-long"></i> Explore Our Vision
        </a>
      </div>

      <!-- Stats Side -->
      <div class="col-lg-6 reveal delay-3">
        <div class="about-visual">
          <div class="about-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=700"
              alt="Indian Farmer"
              class="about-img"
              loading="lazy"
            />
            <div class="about-img-badge">
              <i class="fa-solid fa-award"></i>
              <div>
                <div class="aib-num">4.9/5</div>
                <div class="aib-label">Platform Rating</div>
              </div>
            </div>
          </div>

          <div class="about-stats-grid">
            <div class="about-stat-card">
              <div class="asc-num">10K+</div>
              <div class="asc-label">Active Farmers</div>
            </div>
            <div class="about-stat-card">
              <div class="asc-num">28</div>
              <div class="asc-label">States Covered</div>
            </div>
            <div class="about-stat-card">
              <div class="asc-num">₹2Cr+</div>
              <div class="asc-label">Monthly Trade</div>
            </div>
            <div class="about-stat-card">
              <div class="asc-num">99%</div>
              <div class="asc-label">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Values Row -->
    <div class="about-values-row mt-5">
      <div class="about-value-card reveal delay-0">
        <div class="avc-icon">🌱</div>
        <h4 class="avc-title">Sustainability</h4>
        <p class="avc-desc">We promote organic and eco-friendly farming practices for a healthier planet.</p>
      </div>
      <div class="about-value-card reveal delay-2">
        <div class="avc-icon">🤝</div>
        <h4 class="avc-title">Transparency</h4>
        <p class="avc-desc">Full supply chain visibility — you always know where your food comes from.</p>
      </div>
      <div class="about-value-card reveal delay-4">
        <div class="avc-icon">🧬</div>
        <h4 class="avc-title">Innovation</h4>
        <p class="avc-desc">AI-powered tools, real-time data, and smart logistics that evolve with farmers.</p>
      </div>
      <div class="about-value-card reveal delay-6">
        <div class="avc-icon">💪</div>
        <h4 class="avc-title">Empowerment</h4>
        <p class="avc-desc">Helping every farmer earn more, work smarter, and build a lasting legacy.</p>
      </div>
    </div>
  </div>
</section>
  `,
  styles: [`
.about-section {
  padding: 100px 0;
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}
.about-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #16a34a;
  margin-bottom: 16px;
}
.about-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 800;
  color: #0a3d20;
  line-height: 1.2;
  margin-bottom: 20px;
}
.about-highlight {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.about-desc {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.8;
  margin-bottom: 28px;
}
.about-points { display: flex; flex-direction: column; gap: 18px; margin-bottom: 36px; }
.about-point {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(34,197,94,0.05);
  border: 1px solid rgba(34,197,94,0.12);
  border-radius: 16px;
  transition: all 0.3s ease;
}
.about-point:hover {
  background: rgba(34,197,94,0.09);
  border-color: rgba(34,197,94,0.25);
  transform: translateX(4px);
}
.ap-icon  { font-size: 1.5rem; flex-shrink: 0; }
.ap-title { font-weight: 700; color: #0a3d20; font-size: 0.95rem; margin-bottom: 4px; }
.ap-desc  { font-size: 0.83rem; color: #6b7280; }
.about-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 14px 32px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.35s ease;
  box-shadow: 0 4px 20px rgba(34,197,94,0.3);
  text-decoration: none;
}
.about-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(34,197,94,0.45);
  color: #fff;
}

/* Visual side */
.about-visual { position: relative; }
.about-img-wrap {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  margin-bottom: 20px;
}
.about-img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}
.about-img-wrap:hover .about-img { transform: scale(1.04); }
.about-img-badge {
  position: absolute;
  bottom: 20px; right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(14px);
  border-radius: 16px;
  padding: 12px 18px;
  box-shadow: 0 4px 20px rgba(10,61,32,0.15);
  border: 1px solid rgba(34,197,94,0.15);
}
.about-img-badge i { color: #f59e0b; font-size: 1.4rem; }
.aib-num   { font-family: 'Poppins',sans-serif; font-size: 1.2rem; font-weight: 800; color: #0a3d20; }
.aib-label { font-size: 0.72rem; color: #6b7280; font-weight: 600; }
.about-stats-grid {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 14px;
}
.about-stat-card {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(34,197,94,0.12);
  border-radius: 18px;
  padding: 20px 14px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(10,61,32,0.06);
  transition: all 0.3s ease;
}
.about-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(10,61,32,0.12);
  border-color: rgba(34,197,94,0.25);
}
.asc-num   { font-family: 'Poppins',sans-serif; font-size: 1.3rem; font-weight: 800; color: #16a34a; }
.asc-label { font-size: 0.7rem; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }

/* Values */
.about-values-row {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 20px;
}
.about-value-card {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(34,197,94,0.1);
  border-radius: 22px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(10,61,32,0.06);
  transition: all 0.4s ease;
}
.about-value-card:hover {
  background: linear-gradient(145deg, #f0fdf4, #dcfce7);
  border-color: rgba(34,197,94,0.25);
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(10,61,32,0.12);
}
.avc-icon  { font-size: 2.4rem; margin-bottom: 14px; }
.avc-title { font-family: 'Poppins',sans-serif; font-size: 1.05rem; font-weight: 800; color: #0a3d20; margin-bottom: 10px; }
.avc-desc  { font-size: 0.85rem; color: #6b7280; line-height: 1.65; }

/* Reveal */
.reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.75s ease, transform 0.75s cubic-bezier(0.22,1,0.36,1); }
.reveal.visible { opacity: 1; transform: translateY(0); }

@media (max-width: 991px) {
  .about-values-row, .about-stats-grid { grid-template-columns: repeat(2,1fr); }
  .about-section { padding: 70px 0; }
}
@media (max-width: 576px) {
  .about-values-row { grid-template-columns: 1fr 1fr; }
  .about-stats-grid { grid-template-columns: 1fr 1fr; }
}
  `]
})
export class AboutUsComponent { }
