import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { curriculum, featuredCourses } from '../shared/app-data';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-course-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="explore-shell course-overview-shell">
      <div class="el-grain"></div>

      <!-- Navbar -->
      <header class="explore-topbar">
        <a routerLink="/" class="brand-mark brand-link">EDULEARN</a>
        <nav class="landing-nav" aria-label="Primary">
          <a routerLink="/" class="el-nav-link">Home</a>
          <a routerLink="/explore" class="el-nav-link">Courses</a>
          <a href="#" class="el-nav-link">About</a>
        </nav>
        @if (auth.isLoggedIn()) {
          <a [routerLink]="'/' + auth.user()?.role?.toLowerCase() + (auth.user()?.role === 'ADMIN' ? '' : '/profile')" class="topbar-signin">👤 Profile</a>
        } @else {
          <a routerLink="/auth" class="topbar-signin">Sign In</a>
        }
      </header>

      <!-- Main Content -->
      <main class="explore-content course-overview-content">
        <!-- Left Column -->
        <div class="course-overview-left">
          <!-- Thumbnail -->
          <div class="course-thumbnail" [style.background]="course.gradient"></div>

          <!-- Header -->
          <div class="course-header-section">
            <span class="pill">{{ course.badge }}</span>
            <h1 class="page-title" style="margin-top: 0.6rem; margin-bottom: 0.6rem;">{{ course.title }}</h1>
            <p class="page-copy" style="font-size: 0.95rem; opacity: 0.8;">{{ course.description }}</p>
          </div>

          <!-- Meta Row with dividers -->
          <div class="course-meta-divider"></div>
          <div class="course-meta-row" style="display: flex; gap: 1.5rem; align-items: center; padding: 1rem 0;">
            @if (course.rating && course.rating !== 0) {
              <span class="meta-item">Rating {{ course.rating }}</span>
            }
            @if (course.students && course.students !== 0) {
              <span class="meta-item">{{ course.students }} Students</span>
            }
            <span class="meta-item">18 Lessons</span>
            <span class="meta-item">18h 30m</span>
          </div>
          <div class="course-meta-divider"></div>

          <!-- Instructor -->
          <div class="course-instructor-section">
            <p class="page-copy" style="margin: 0; font-size: 0.8rem;">
              @if (course.instructor && course.instructor !== 'Unknown') {
                <strong>Updated Mar 2026</strong> · by <span style="color: var(--el-accent); font-weight: 500;">{{ course.instructor }}</span>
              } @else {
                <strong>Updated Mar 2026</strong>
              }
            </p>
          </div>

          <!-- Curriculum -->
          <div class="course-curriculum-section">
            <div class="curriculum-label">CURRICULUM</div>
            <div style="display: grid; gap: 0.6rem; margin-top: 0.85rem;">
              @for (section of curriculum; track section.id) {
                <div class="curriculum-row">
                  <span style="font-weight: 500; font-size: 0.82rem;">{{ section.title }}</span>
                  <span class="curriculum-meta">· {{ section.lessons.length }} lessons</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right Column (Sticky Sidebar) -->
        <aside class="course-overview-right">
          <!-- Pricing Card -->
          <article class="overview-card pricing-card">
            <div class="pricing-label">Price</div>
            <div class="pricing-main">₹49</div>
            <div class="pricing-original">
              <span class="original-price">₹99</span>
              <span class="discount-badge">50% off</span>
            </div>

            <div class="offer-banner">
              🔥 Offer ends in 2 days!
            </div>

            <a [routerLink]="['/course', course.id, 'lesson', 1]" class="btn-enroll">Enroll Now</a>
            <button class="btn-try-free">Try for Free</button>
          </article>

          <!-- Course Includes Card -->
          <article class="overview-card includes-card">
            <div class="includes-label">This course includes:</div>
            <ul class="includes-list">
              <li>✓ 18+ hours of video content</li>
              <li>✓ 42 downloadable resources</li>
              <li>✓ Full forum access</li>
              <li>✓ Mobile & desktop access</li>
              <li>✓ Certificate of completion</li>
              <li>✓ Lifetime access</li>
            </ul>
          </article>

          <!-- Start Learning -->
          <article class="overview-card start-card">
            <div style="text-align: center;">
              <p class="page-copy" style="margin-bottom: 0.6rem;">Ready to begin?</p>
              <a [routerLink]="['/course', course.id, 'lesson', 1]" class="btn-start">
                Start Learning →
              </a>
            </div>
          </article>
        </aside>
      </main>
    </div>
  `,
  styles: `
    .course-overview-shell {
      display: flex;
      flex-direction: column;
      width: 100vw;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .course-overview-shell::-webkit-scrollbar {
      width: 8px;
    }

    .course-overview-shell::-webkit-scrollbar-track {
      background: transparent;
    }

    .course-overview-shell::-webkit-scrollbar-thumb {
      background: rgba(106, 170, 106, 0.3);
      border-radius: 4px;
    }

    .course-overview-shell::-webkit-scrollbar-thumb:hover {
      background: rgba(106, 170, 106, 0.5);
    }

    .explore-topbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .course-overview-content {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      width: 100% !important;
      max-width: 100% !important;
      padding: 24px 40px;
      box-sizing: border-box;
      flex: 1;
      z-index: 2;
      position: relative;
      overflow: visible;
    }

    .course-overview-content::-webkit-scrollbar {
      display: none;
    }

    .course-overview-left {
      display: grid;
      gap: 1.5rem;
    }

    .course-thumbnail {
      width: 100%;
      height: 280px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6aaa6a, #b9d9a0);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .course-header-section {
      display: grid;
      gap: 0.6rem;
    }

    .course-meta-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
    }

    .course-meta-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      padding: 16px 0;
    }

    .meta-item {
      font-size: 0.8rem;
      opacity: 0.75;
      white-space: nowrap;
    }

    .course-instructor-section {
      padding: 12px 0;
    }

    .course-curriculum-section {
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .curriculum-label {
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      opacity: 0.5;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 0.85rem;
    }

    .curriculum-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      transition: background 0.2s ease;
    }

    .curriculum-row:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .curriculum-meta {
      font-size: 0.8rem;
      opacity: 0.6;
    }

    .course-overview-right {
      position: sticky;
      top: 80px;
      align-self: start;
      display: grid;
      gap: 12px;
      height: fit-content;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(106, 170, 106, 0.2) transparent;
    }

    .course-overview-right::-webkit-scrollbar {
      width: 6px;
    }

    .course-overview-right::-webkit-scrollbar-track {
      background: transparent;
    }

    .course-overview-right::-webkit-scrollbar-thumb {
      background: rgba(106, 170, 106, 0.2);
      border-radius: 3px;
    }

    .course-overview-right::-webkit-scrollbar-thumb:hover {
      background: rgba(106, 170, 106, 0.35);
    }

    .overview-card {
      border-radius: 16px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.07);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .pricing-card {
      display: grid;
      gap: 12px;
    }

    .pricing-label {
      font-size: 0.7rem;
      opacity: 0.6;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .pricing-main {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }

    .pricing-original {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 0.8rem;
    }

    .original-price {
      opacity: 0.5;
      text-decoration: line-through;
    }

    .discount-badge {
      color: var(--el-accent);
      font-weight: 600;
    }

    .offer-banner {
      border-radius: 8px;
      background: rgba(255, 180, 0, 0.15);
      border: 1px solid rgba(255, 180, 0, 0.3);
      font-size: 0.8rem;
      padding: 8px 12px;
      text-align: center;
    }

    .btn-enroll {
      display: block;
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 999px;
      background: var(--el-text-primary);
      color: var(--el-bg-deep);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.2s ease;
      text-decoration: none;
      text-align: center;
    }

    .btn-enroll:hover {
      background: rgba(255, 255, 255, 0.95);
    }

    .btn-try-free {
      width: 100%;
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 999px;
      background: transparent;
      color: var(--el-text-primary);
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-try-free:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.35);
    }

    .includes-card {
      display: grid;
      gap: 0.85rem;
    }

    .includes-label {
      font-weight: 600;
      font-size: 0.85rem;
      margin-bottom: 0.3rem;
    }

    .includes-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 0;
    }

    .includes-list li {
      font-size: 0.82rem;
      opacity: 0.85;
      line-height: 2;
      color: var(--el-accent);
    }

    .start-card {
      text-align: center;
    }

    .btn-start {
      display: inline-block;
      width: 100%;
      padding: 12px;
      border-radius: 999px;
      background: var(--el-accent);
      color: var(--el-text-primary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .btn-start:hover {
      background: #7bb47b;
      transform: translateY(-2px);
    }

    @media (max-width: 1200px) {
      .course-overview-content {
        grid-template-columns: 1fr;
      }

      .course-overview-right {
        position: static;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        max-height: none;
        overflow-y: visible;
      }
    }

    @media (max-width: 820px) {
      .course-overview-content {
        grid-template-columns: 1fr;
        padding: 24px 20px;
      }

      .course-thumbnail {
        height: 200px;
      }

      .course-meta-row {
        gap: 12px;
        font-size: 0.75rem;
      }
    }
  `,
})
export class CourseOverviewComponent {
  private readonly route = inject(ActivatedRoute);
  public auth = inject(AuthService);
  protected readonly curriculum = curriculum;

  protected course = featuredCourses[0];

  constructor() {
    this.route.params.subscribe((params) => {
      const courseId = parseInt(params['courseId'], 10);
      const found = featuredCourses.find((c) => c.id === courseId);
      if (found) {
        this.course = found;
      }
    });
  }
}
