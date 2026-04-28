import {
  Component,
  AfterViewInit,
  NgZone,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/navbar/nav.component/nav.component';
import { FooterComponent } from './shared/footer/footer.component/footer.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements AfterViewInit {

  showIntro = true;
  isActive = false; // 👈 control animation via binding

  constructor(
    public auth: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Start animation
    setTimeout(() => {
      this.isActive = true;
      this.cdr.detectChanges();
    }, 100);

    // End intro
    setTimeout(() => {
      this.showIntro = false;
      this.cdr.detectChanges();
    }, 5000); // 👈 shorter + smoother UX
  }
}
