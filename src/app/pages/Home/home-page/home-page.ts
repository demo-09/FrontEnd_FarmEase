import { Component } from '@angular/core';
import {  CommonModule } from '@angular/common';
import { AboutUsComponent } from '../about-us';
import { HeroSectionComponent } from '../hero-section.component';
import { FaqSectionComponent } from '../faq';
import { Services } from '../services';
import { Testimonials } from '../../../Components/testimonials/testimonials';
@Component({
  selector: 'app-home-page',
  imports: [CommonModule, AboutUsComponent, HeroSectionComponent, Services, FaqSectionComponent, Testimonials],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}
