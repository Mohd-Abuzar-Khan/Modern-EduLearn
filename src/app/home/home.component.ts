import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="landing-shell">
      <div class="glow-warm"></div>
      <div class="glow-teal"></div>

      <header class="landing-topbar">
        <a routerLink="/" class="brand-mark brand-link">EDULEARN</a>

        <nav class="landing-nav" aria-label="Primary">
          <a routerLink="/explore" class="el-nav-link">Courses</a>
          <a routerLink="/about" class="el-nav-link">About</a>
          <a routerLink="/community" class="el-nav-link">Community</a>
        </nav>

        @if (auth.isLoggedIn()) {
          <a [routerLink]="'/' + auth.user()?.role?.toLowerCase() + (auth.user()?.role === 'ADMIN' ? '' : '/profile')" class="topbar-signin">Profile</a>
        } @else {
          <a routerLink="/auth" [queryParams]="{mode: 'login'}" class="topbar-signin">Sign In</a>
        }
      </header>

      <div class="home-scroll" #scrollContainer (scroll)="handleScroll()">
        <!-- SLIDE 1: MINIMAL INTRO -->
        <section class="home-section hero-slide">
          <div class="el-grain"></div>
          <div class="hero-copy el-fade-1">
            <h1 class="el-heading">Learn without boundaries</h1>
            <p>Immersive courses crafted by world-class creators. Unlock your potential in design, code, and beyond.</p>
          </div>

          <button class="scroll-hint" type="button" (click)="scrollToSection(1)">
            Scroll <span class="arrow-move">→</span>
          </button>
        </section>

        <!-- SLIDE 2: STATS OF APPLICATION -->
        <section class="home-section story-slide">
          <div class="el-grain"></div>
          <div class="story-copy el-fade-2">
            <div class="header-section">
              <p class="platform-header">THE PLATFORM</p>
            </div>
            <h2 class="el-heading">Education reimagined for the modern creative</h2>
            <p>EduLearn brings together the world's most talented instructors with a learning experience that feels alive. Every course is designed to be immersive, hands-on, and endlessly rewarding.</p>
            
            <div class="story-metrics">
              @for (stat of storyStats; track stat.label) {
                <div class="metric">
                  <strong>{{ stat.value }}</strong>
                  <span>{{ stat.label }}</span>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- SLIDE 3: ESSENCE CARDS -->
        <section class="home-section essence-slide">
          <div class="el-grain"></div>
          <div class="slide-header el-fade-3" style="padding: 0 clamp(48px, 8vw, 140px); width: 100%; margin-bottom: 2rem;">
            <div class="header-section">
              <p class="featured-header">OUR ESSENCE</p>
            </div>
            <h2 class="el-heading" style="font-size: clamp(30px, 3.8vw, 48px); font-weight: 500;">Why choose EduLearn?</h2>
          </div>

          <div class="essence-strip el-fade-3">
            <article class="essence-card">
              <div class="essence-num">01.</div>
              <h3 class="essence-title">Mastery</h3>
              <p class="essence-desc">Go beyond the basics. Our courses are structured to build profound understanding, taking you from novice to expert through structured, progressive challenges.</p>
            </article>

            <article class="essence-card">
              <div class="essence-num">02.</div>
              <h3 class="essence-title">Community</h3>
              <p class="essence-desc">Join a global network of ambitious learners. Engage in vibrant discussions, share your progress, and get feedback from peers and instructors alike.</p>
            </article>

            <article class="essence-card">
              <div class="essence-num">03.</div>
              <h3 class="essence-title">Innovation</h3>
              <p class="essence-desc">Learn the latest tools, frameworks, and methodologies. Our curriculum adapts continuously to match the cutting-edge demands of the industry.</p>
            </article>
          </div>
        </section>

        <!-- SLIDE 4: CLOSING & AUTH BUTTONS -->
        <section class="home-section login-slide">
          <div class="el-grain"></div>
          <article class="el-card sign-in-card el-fade-4" style="text-align: center;">
            <h2 class="el-heading">Ready to begin?</h2>
            <p class="page-copy" style="margin: 1rem 0 2.5rem; font-size: 1.1rem; opacity: 0.8;">
              Take the next step in your learning journey. Join EduLearn today and unlock a world of possibilities.
            </p>

            <div class="home-login-buttons" style="display: flex; flex-direction: column; gap: 1rem;">
              <a routerLink="/auth" class="el-btn" style="text-decoration: none; text-align: center; display: block; width: 100%; padding: 16px;">
                Create an Account
              </a>
              <a routerLink="/auth" class="el-btn home-login-btn-alt" style="text-decoration: none; text-align: center; display: block; width: 100%; padding: 16px;">
                Sign In
              </a>
            </div>

            <div style="text-align: center; margin-top: 1.5rem;">
              <a routerLink="/explore" class="auth-link-btn" style="color: var(--el-text-muted); font-size: 0.9rem;">
                Continue as Guest <span class="arrow-move">→</span>
              </a>
            </div>
          </article>
        </section>
      </div>

      <!-- NAVIGATION -->
      <div class="el-dots" aria-label="Landing sections">
        @for (section of sections; track section) {
          <button class="el-dot" type="button" [class.el-dot--active]="section === currentSection" (click)="scrollToSection(section)" [attr.aria-label]="'Go to section ' + (section + 1)" [attr.aria-current]="section === currentSection"></button>
        }
      </div>
    </div>
  `,
  styles: `
    .essence-slide {
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: rgba(0,0,0,0.4);
    }
    
    .essence-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      padding: 0 clamp(48px, 8vw, 140px);
      width: 100%;
      z-index: 2;
    }
    
    .essence-card {
      background: var(--el-card-bg);
      border: 1px solid var(--el-card-border);
      border-radius: 20px;
      padding: 36px 32px;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease, border-color 0.3s ease;
      cursor: pointer;
    }
    
    .essence-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 24px 64px rgba(0,0,0,0.4);
      border-color: rgba(255,255,255,0.2);
    }
    
    .essence-num {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      color: rgba(255,255,255,0.4);
      font-weight: 500;
      margin-bottom: 24px;
      letter-spacing: 0.05em;
    }
    
    .essence-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 500;
      color: var(--el-text-primary);
      margin-bottom: 16px;
    }
    
    .essence-desc {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: var(--el-text-secondary);
      margin: 0;
    }

    .home-login-buttons {
      margin-top: 0.5rem;
    }
    
    .sign-in-card {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      backdrop-filter: blur(24px) !important;
      -webkit-backdrop-filter: blur(24px) !important;
      color: #fff !important;
    }

    .sign-in-card .el-heading {
      color: #fff !important;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .sign-in-card .page-copy {
      color: rgba(255, 255, 255, 0.8) !important;
      font-size: 0.95rem;
    }

    .sign-in-card .field span {
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.85rem;
      text-transform: none;
      letter-spacing: normal;
    }

    .sign-in-card .el-input {
      background: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
      color: #fff !important;
      border-radius: 12px;
    }

    .sign-in-card .el-input::placeholder {
      color: rgba(255, 255, 255, 0.8) !important;
    }

    .sign-in-card .el-btn:not(.home-login-btn-alt) {
      background: #fff !important;
      color: #1a1a1a !important;
      border-radius: 12px;
      font-weight: 600;
      transition: transform 0.2s ease, box-shadow 0.2s;
    }
    
    .sign-in-card .el-btn:not(.home-login-btn-alt):hover {
      background: #f0f0f0 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255,255,255,0.2);
    }

  `,
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer') private readonly scrollContainer?: ElementRef<HTMLDivElement>;

  protected readonly sections = [0, 1, 2, 3];
  protected readonly totalSections = 4;
  protected currentSection = 0;
  protected readonly storyStats = [
    { label: 'Students', value: '15K+' },
    { label: 'Courses', value: '300+' },
    { label: 'Satisfaction', value: '99%' },
  ];

  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private autoScrollInterval: ReturnType<typeof setInterval> | null = null;
  private querySectionSub: Subscription | null = null;

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute,
    protected readonly router: Router,
    public readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    // Note: If you want to keep featured courses nearby, you can still fetch them. 
    // They are removed from the template, but we keep the auth check intact if needed.
  }

  ngAfterViewInit(): void {
    this.querySectionSub = this.route.queryParamMap.subscribe((params) => {
      const sectionParam = params.get('section');
      if (sectionParam === null) {
        this.scrollToSection(0);
        return;
      }

      const parsed = Number(sectionParam);
      if (Number.isInteger(parsed)) {
        this.scrollToSection(parsed);
      }
    });

    this.startAutoScroll();
  }

  ngOnDestroy(): void {
    this.querySectionSub?.unsubscribe();
    this.stopAutoScroll();
  }

  private startAutoScroll(): void {
    this.stopAutoScroll();
    this.autoScrollInterval = setInterval(() => {
      const nextSection = (this.currentSection + 1) % this.totalSections;
      this.scrollToSection(nextSection);
    }, 5000);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  protected scrollToSection(index: number): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const clamped = Math.max(0, Math.min(index, this.totalSections - 1));
    const sectionWidth = container.offsetWidth;
    container.scrollTo({ left: clamped * sectionWidth, behavior: 'smooth' });
    this.currentSection = clamped;
    
    // Reset auto-scroll timer on manual navigation
    this.startAutoScroll();
  }

  protected handleScroll(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      const container = this.scrollContainer?.nativeElement;
      if (!container || container.offsetWidth === 0) return;
      this.currentSection = Math.round(container.scrollLeft / container.offsetWidth);
      
      // Keep auto-scroll running, but reset its clock after user manually scrolled
      this.startAutoScroll();
    }, 100);
  }
}
