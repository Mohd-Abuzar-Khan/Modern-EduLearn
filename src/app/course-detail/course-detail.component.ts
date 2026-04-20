import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

declare var Razorpay: any;

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  template: `
    <div class="explore-shell course-detail-shell">
      <div class="el-grain"></div>

      <header class="explore-topbar">
        <a routerLink="/" class="brand-mark brand-link">EDULEARN</a>
        <nav class="landing-nav" aria-label="Primary">
          <a routerLink="/" class="el-nav-link">Home</a>
          <a routerLink="/explore" class="el-nav-link">Courses</a>
          <a routerLink="/about" class="el-nav-link">About</a>
        </nav>
        @if (authService.isLoggedIn()) {
          <a [routerLink]="'/' + authService.user()?.role?.toLowerCase() + (authService.user()?.role === 'ADMIN' ? '' : '/profile')" class="topbar-signin">Profile</a>
        } @else {
          <a routerLink="/auth" class="topbar-signin">Sign In</a>
        }
      </header>

      <main class="content-wrap course-detail-content">
        <section class="course-detail-shell-inner">
          <div class="course-detail-grid">
            <div class="course-main-panel">
              <article class="video-panel glass-card">
                <div class="video-stage" [style.background]="course.gradient">
                  <button class="play-badge" type="button" aria-label="Play lesson">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                  <span class="video-hint">Click to play</span>

                  <div class="video-controls">
                    <span class="video-time">04:22 / 12:30</span>
                    <div class="video-track-wrap">
                      <div class="video-track">
                        <div class="video-fill" [style.width.%]="34"></div>
                        <span class="video-knob"></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="lesson-summary">
                  <div class="lesson-meta-row">
                    <span class="page-copy">Video · 12:30 · Section 1 · Lesson 2 of {{ totalLessons }}</span>
                  </div>
                  <h1 class="page-title lesson-title">{{ course.title }}</h1>
                  <p class="page-copy lesson-copy">{{ course.description }}</p>

                  <div class="lesson-chip-row" style="margin-top: 1rem; display: flex; gap: 0.6rem; flex-wrap: wrap;">
                    @if (course.instructor && course.instructor !== 'Unknown') {
                      <span class="chip">By {{ course.instructor }}</span>
                    }
                    @if (course.rating && course.rating !== '0') {
                      <span class="chip">{{ course.rating }} Rating</span>
                    }
                    @if (course.students && course.students !== '0') {
                      <span class="chip">{{ course.students }} Students</span>
                    }
                    @if (course.badge && course.badge !== 'Beginner') {
                      <span class="chip">{{ course.badge }}</span>
                    }
                  </div>
                </div>

                <div class="lesson-tabs">
                  <button class="lesson-tab" [class.lesson-tab--active]="activeTab === 'resources'" type="button" (click)="activeTab = 'resources'">
                    Resources
                  </button>
                  <button class="lesson-tab" [class.lesson-tab--active]="activeTab === 'discussion'" type="button" (click)="activeTab = 'discussion'">
                    Discussion
                  </button>
                </div>

                @if (activeTab === 'resources') {
                  <div class="lesson-content-block">
                    <div class="section-head-row">
                      <h2 class="section-title" style="font-size: 1.25rem;">Lesson Resources</h2>
                    </div>

                    <div class="resource-list" style="display: grid; gap: 0.85rem;">
                      @if (resourceItems.length === 0) {
                        <div class="soft-card" style="padding: 2.5rem 1.5rem; text-align: center; border-radius: 20px; display: grid; gap: 1rem; place-items: center; background: rgba(255,255,255,0.03);">
                          <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(255,255,255,0.06); display: grid; place-items: center; color: var(--el-text-muted);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                          </div>
                          <div>
                            <h3 style="margin: 0; font-size: 1.05rem; font-weight: 500; color: var(--el-text-primary);">No learning resources published yet</h3>
                            <p class="page-copy" style="font-size: 0.85rem; margin-top: 0.35rem; opacity: 0.7;">Additional materials like PDFs and source code will appear here.</p>
                          </div>
                        </div>
                      } @else {
                        @for (resource of resourceItems; track resource.id) {
                          <div class="resource-item soft-card">
                            <div class="resource-icon">{{ resource.icon }}</div>
                            <div>
                              <strong>{{ resource.title }}</strong>
                              <p class="page-copy">{{ resource.meta }}</p>
                            </div>
                            <span class="resource-action">↓</span>
                          </div>
                        }
                      }
                    </div>
                  </div>
                } @else {
                  <div class="lesson-content-block">
                    <div class="section-head-row">
                      <h2 class="section-title" style="font-size: 1.25rem;">Discussion</h2>
                    </div>

                    <div style="margin-bottom: 1rem;">
                      <textarea class="el-input" rows="2" [(ngModel)]="newThreadBody" placeholder="Start a new discussion..."></textarea>
                      <button class="el-btn" style="margin-top: 0.5rem; padding: 0.5rem 1rem;" 
                              (click)="postThread()" 
                              [disabled]="!newThreadBody.trim() || postingThread">
                        {{ postingThread ? 'Posting...' : 'Post' }}
                      </button>
                    </div>

                    <div class="discussion-list">
                      @if (discussionThreads.length === 0) {
                        <p class="page-copy" style="font-size: 0.9rem;">No discussion threads yet. Be the first!</p>
                      }
                      
                      @for (thread of discussionThreads; track thread.threadId) {
                        <div class="soft-card discussion-item">
                          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <strong>{{ thread.authorName || 'Guest Student' }}</strong>
                            <small style="color: var(--el-text-muted); font-size: 0.75rem;">
                              {{ thread.createdAt ? (thread.createdAt | date:'short') : 'Just now' }}
                            </small>
                          </div>
                          @if (thread.title && thread.title.trim()) {
                            <h4 style="margin: 0.3rem 0; font-size: 0.9rem; color: var(--el-text-primary);">{{ thread.title }}</h4>
                          }
                          <p class="page-copy" style="font-size: 0.85rem;">{{ thread.body }}</p>
                        </div>
                      }
                    </div>
                  </div>
                }
              </article>
            </div>

            <aside class="course-sidebar glass-card">
              <!-- Enroll CTA -->
              <div style="padding:0.8rem;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:0.8rem;">
                @if (checkingEnrollment) {
                  <p class="page-copy" style="font-size:0.82rem;">Checking enrollment…</p>
                } @else if (isEnrolled) {
                  <p class="page-copy" style="color:#6aaa6a;font-size:0.85rem;margin-bottom:0.5rem;">✓ You are enrolled</p>
                  <a [routerLink]="['/course', course.id, 'lesson', firstLessonId]" class="el-btn" style="display:block;text-align:center;text-decoration:none;">Continue Learning</a>
                } @else {
                  <button class="el-btn" style="width:100%;" type="button" (click)="enroll()" [disabled]="enrolling">
                    {{ enrolling ? 'Enrolling…' : 'Enroll Now — ₹' + (course?.price || 0) }}
                  </button>
                }
                @if (enrollMsg) {
                  <p class="page-copy" style="font-size:0.8rem;margin-top:0.4rem;" [style.color]="isEnrolled ? '#6aaa6a' : '#e05c5c'">{{ enrollMsg }}</p>
                }
              </div>

              <div class="course-sidebar-head">
                <h2 class="section-title" style="font-size: 1.2rem;">Course Content</h2>
                <div class="sidebar-progress-wrap">
                  <div class="course-progress-track small-track">
                    <div class="course-progress-fill" [style.width.%]="progressPercent"></div>
                  </div>
                  <span class="page-copy" style="font-size: 0.8rem;">{{ progressPercent }}%</span>
                </div>
              </div>

              <div class="content-sections">
                @for (section of curriculum; track section.id) {
                  <div class="section-card">
                    <button class="section-toggle" type="button" (click)="toggleSection(section.id)">
                      <div class="section-header-content">
                        <span class="section-title-text">{{ section.title }}</span>
                        <span class="section-lesson-count">{{ section.lessons.length }} lesson{{ section.lessons.length !== 1 ? 's' : '' }}</span>
                      </div>
                      <span class="section-toggle-icon">{{ expandedSection === section.id ? '▼' : '▲' }}</span>
                    </button>

                    @if (expandedSection === section.id) {
                      <div class="lesson-list">
                        @for (lesson of section.lessons; track lesson.id) {
                          <button class="lesson-row" type="button" [class.lesson-row--active]="isLessonActive(section.id, lesson.id)" (click)="openLesson(lesson.id)">
                            <span class="lesson-status" [class.lesson-status--done]="lesson.id < 2">{{ lesson.id < 2 ? '✓' : '▶' }}</span>
                            <span class="lesson-row-text">
                              <strong>{{ lesson.title }}</strong>
                              <small>{{ lesson.duration }}</small>
                            </span>
                            <span class="lesson-badges">
                              @if (lesson.free) {
                                <span class="badge-free">FREE</span>
                              }
                              <span class="lesson-duration">{{ lesson.duration }}</span>
                            </span>
                          </button>
                        }
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Lessons Overview Section -->
              <div class="lessons-overview">
                <button class="overview-toggle" type="button" (click)="showLessonsOverview = !showLessonsOverview">
                  <span>All Lessons</span>
                  <span class="overview-toggle-icon">{{ showLessonsOverview ? '▲' : '▼' }}</span>
                </button>
                
                @if (showLessonsOverview) {
                  <div class="overview-list glass-card">
                    @for (lesson of allLessons; track lesson.id) {
                      <div class="overview-item soft-card">
                        <span class="overview-status">{{ lesson.completed ? '✓' : lesson.id }}.</span>
                        <div class="overview-content">
                          <strong>{{ lesson.title }}</strong>
                          <small>{{ lesson.duration }} min</small>
                        </div>
                        <span class="overview-badge">{{ lesson.type }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: `
    .course-detail-shell {
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: 100vh;
      overflow-x: hidden;
      overflow-y: hidden;
      position: relative;
      isolation: isolate;
    }

    .course-detail-content {
      background: transparent;
      border: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border-radius: 0;
      margin: 0;
      padding: 0;
      width: 100%;
      max-width: 100%;
      height: 100%;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1;
    }

    .course-detail-shell-inner {
      display: grid;
      gap: 1rem;
      width: 100%;
      min-height: 100%;
      padding: clamp(1rem, 2vw, 2rem);
    }

    .course-detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 1rem;
      align-items: start;
      width: 100%;
    }

    .video-panel,
    .course-sidebar {
      border-radius: 24px;
      overflow: hidden;
    }

    .video-stage {
      min-height: 260px;
      position: relative;
      display: grid;
      place-items: center;
      padding: 1.2rem;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .video-stage::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(26, 46, 26, 0.15));
    }

    .play-badge {
      position: relative;
      z-index: 1;
      width: 62px;
      height: 62px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.9);
      color: var(--el-bg-deep);
      font-size: 1.1rem;
      display: grid;
      place-items: center;
      box-shadow: 0 16px 30px rgba(0, 0, 0, 0.12);
    }

    .video-hint {
      position: absolute;
      z-index: 1;
      top: 50%;
      margin-top: 56px;
      font-size: 0.92rem;
      color: rgba(255, 255, 255, 0.72);
    }

    .video-controls {
      position: absolute;
      left: 1rem;
      right: 1rem;
      bottom: 1rem;
      z-index: 1;
      display: grid;
      gap: 0.65rem;
    }

    .video-time {
      color: rgba(255, 255, 255, 0.95);
      font-size: 0.9rem;
      letter-spacing: 0.08em;
    }

    .video-track-wrap {
      width: 100%;
    }

    .video-track {
      position: relative;
      height: 6px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.28);
    }

    .video-fill {
      position: absolute;
      inset: 0 auto 0 0;
      border-radius: inherit;
      background: rgba(192, 166, 233, 0.85);
    }

    .video-knob {
      position: absolute;
      top: 50%;
      left: 34%;
      width: 16px;
      height: 16px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(255,255,255,0.22);
    }

    .lesson-summary {
      padding: 1rem;
      display: grid;
      gap: 0.8rem;
    }

    .lesson-meta-row {
      color: var(--el-text-muted);
      font-size: 0.85rem;
    }

    .lesson-title {
      margin: 0;
      font-size: clamp(2rem, 3vw, 2.8rem);
    }

    .lesson-copy {
      max-width: 75ch;
    }

    .lesson-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    .lesson-tabs {
      display: flex;
      gap: 0.25rem;
      padding: 0 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .lesson-tab {
      border: none;
      background: transparent;
      color: var(--el-text-secondary);
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.95rem;
      padding: 0.9rem 0.2rem;
      border-bottom: 2px solid transparent;
    }

    .lesson-tab--active {
      color: var(--el-text-primary);
      border-bottom-color: var(--el-accent);
    }

    .lesson-content-block {
      padding: 1rem;
      display: grid;
      gap: 0.85rem;
    }

    .resource-list,
    .discussion-list {
      display: grid;
      gap: 0.7rem;
    }

    .resource-item {
      padding: 0.8rem;
      border-radius: 16px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 0.8rem;
      align-items: center;
    }

    .resource-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,0.08);
    }

    .resource-item strong,
    .discussion-item strong {
      font-family: 'Space Grotesk', sans-serif;
      color: var(--el-text-primary);
    }

    .resource-action {
      color: var(--el-text-secondary);
      font-size: 1rem;
    }

    .discussion-item {
      padding: 0.85rem;
      border-radius: 16px;
      display: grid;
      gap: 0.3rem;
    }

    .course-sidebar {
      padding: 1rem;
      position: sticky;
      top: 1rem;
      align-self: start;
      height: calc(100vh - 2rem);
      max-height: calc(100vh - 2rem);
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(106,170,106,0.3) transparent;
    }

    .course-sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .course-sidebar::-webkit-scrollbar-thumb {
      background: rgba(106,170,106,0.3);
      border-radius: 999px;
    }

    .course-sidebar-head {
      display: grid;
      gap: 0.6rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .sidebar-progress-wrap {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .content-sections {
      display: grid;
    }

    .section-card {
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .section-toggle {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding: 0.95rem 0;
      background: transparent;
      border: 0;
      font-family: 'Space Grotesk', sans-serif;
      color: var(--el-text-primary);
      font-size: 0.95rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .section-toggle:hover {
      opacity: 0.8;
    }

    .section-toggle-icon {
      color: var(--el-text-muted);
    }

    .lesson-list {
      display: grid;
      gap: 0.45rem;
      padding-bottom: 0.9rem;
    }

    .lesson-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      padding: 0.78rem;
      border-radius: 14px;
      border: none;
      background: transparent;
      text-align: left;
      color: var(--el-text-secondary);
      transition: background 0.2s ease, color 0.2s ease;
      cursor: pointer;
    }

    .lesson-row:hover {
      background: rgba(255,255,255,0.06);
    }

    .lesson-row--active {
      background: rgba(106,170,106,0.14);
      color: var(--el-text-primary);
    }

    .lesson-status {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      background: rgba(255,255,255,0.09);
      color: var(--el-text-secondary);
      font-size: 0.75rem;
    }

    .lesson-status--done {
      background: rgba(106,170,106,0.2);
      color: var(--el-glow-cream);
    }

    .lesson-row-text {
      display: grid;
      gap: 0.18rem;
      flex: 1;
      min-width: 0;
    }

    .lesson-row-text strong {
      display: block;
      font-weight: 500;
    }

    .lesson-row-text small {
      color: var(--el-text-muted);
    }

    /* Curriculum Header Styles */
    .section-header-content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex: 1;
    }

    .section-title-text {
      font-weight: 600;
      display: block;
      color: var(--el-text-primary);
    }

    .section-lesson-count {
      font-size: 0.8rem;
      color: var(--el-text-muted);
      display: block;
    }

    /* Lesson Badges */
    .lesson-badges {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      flex-shrink: 0;
      margin-left: auto;
    }

    .badge-free {
      padding: 0.3rem 0.7rem;
      background: rgba(106, 170, 106, 0.2);
      color: #4ade80;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }

    .lesson-duration {
      font-size: 0.8rem;
      color: var(--el-text-muted);
      white-space: nowrap;
    }

    @media (max-width: 1120px) {
      .course-detail-grid {
        grid-template-columns: 1fr;
      }

      .course-sidebar {
        position: static;
        height: auto;
        max-height: none;
      }
    }

    @media (max-width: 820px) {
      .course-detail-shell-inner {
        padding: 1rem;
      }
    }

    @media (max-width: 760px) {
      .course-detail-header {
        padding: 0.8rem;
      }

      .video-stage {
        min-height: 210px;
      }

      .resource-item {
        grid-template-columns: auto 1fr;
      }

      .resource-action {
        display: none;
      }
    }

    /* Lessons Overview */
    .lessons-overview {
      display: grid;
      gap: 0.5rem;
      margin-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 1rem;
    }

    .overview-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: var(--el-text-primary);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .overview-toggle:hover {
      background: rgba(255,255,255,0.08);
    }

    .overview-toggle-icon {
      font-size: 0.75rem;
      opacity: 0.6;
    }

    .overview-list {
      display: grid;
      gap: 0.4rem;
      max-height: 300px;
      overflow-y: auto;
      padding: 0.6rem;
      border-radius: 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.15) transparent;
    }

    .overview-list::-webkit-scrollbar {
      width: 4px;
    }

    .overview-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .overview-list::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 2px;
    }

    .overview-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem;
      border-radius: 8px;
      font-size: 0.8rem;
      transition: all 0.2s;
      cursor: pointer;
    }

    .overview-item:hover {
      background: rgba(255,255,255,0.1);
    }

    .overview-status {
      width: 20px;
      text-align: center;
      flex-shrink: 0;
      font-weight: 600;
      color: var(--el-accent);
    }

    .overview-content {
      flex: 1;
      display: grid;
      gap: 0.1rem;
      min-width: 0;
    }

    .overview-content strong {
      display: block;
      font-size: 0.75rem;
      color: var(--el-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .overview-content small {
      font-size: 0.7rem;
      color: var(--el-text-muted);
    }

    .overview-badge {
      padding: 0.2rem 0.4rem;
      background: rgba(106,170,106,0.15);
      border-radius: 4px;
      font-size: 0.65rem;
      color: var(--el-accent);
      flex-shrink: 0;
    }
  `,
})
export class CourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private apiService = inject(ApiService);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  protected curriculum: any[] = [];
  protected expandedSection = 1;
  protected activeTab: 'resources' | 'discussion' = 'resources';
  protected showLessonsOverview = false;
  protected totalLessons = 0;
  protected completedLessons = 0;
  protected progressPercent = 0;
  protected firstLessonId = 1;
  protected course: any = {
    id: 0,
    title: 'Loading course...',
    description: '',
    instructor: 'Unknown',
    rating: 0,
    students: 0,
    badge: 'Course',
    price: 0,
    gradient: 'linear-gradient(135deg, #2f4f2f, #1f2f1f)',
  };

  protected isEnrolled = false;
  protected enrolling = false;
  protected enrollMsg = '';
  protected checkingEnrollment = true;

  protected allLessons: any[] = [];
  protected resourceItems: Array<{ id: number; icon: string; title: string; meta: string }> = [];

  // Discussion state
  protected discussionThreads: any[] = [];
  protected newThreadBody = '';
  protected postingThread = false;

  ngOnInit() {
    const courseId = Number(this.route.snapshot.paramMap.get('courseId')) || 0;
    if (!courseId) {
      this.checkingEnrollment = false;
      return;
    }

    const uid = this.authService.userId();

    // Fetch Discussion Threads
    this.apiService.getThreadsByCourse(courseId).subscribe({
      next: (data: any[]) => {
        this.discussionThreads = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Failed to load discussion:', e)
    });

    forkJoin({
      courseRes: this.apiService.getCourseById(courseId).pipe(catchError(() => of(null))),
      previewRes: this.apiService.getPreviewLessons(courseId).pipe(catchError(() => of(null))),
      enrollmentRes: uid ? this.apiService.checkEnrolled(uid, courseId).pipe(catchError(() => of(null))) : of(null),
      enrollmentsByStudentRes: uid ? this.apiService.getEnrollmentsByStudent(uid).pipe(catchError(() => of(null))) : of(null),
    }).subscribe({
      next: ({ courseRes, previewRes, enrollmentRes, enrollmentsByStudentRes }) => {
        const courseData = courseRes?.data ?? {};
        this.course = {
          ...this.course,
          ...courseData,
          id: courseData?.courseId ?? courseData?.id ?? courseId,
          gradient: courseData?.thumbnailUrl
            ? `url(${courseData.thumbnailUrl}) center / cover no-repeat`
            : this.course.gradient,
          badge: courseData?.level ?? 'Course',
        };

        const previewLessons = Array.isArray(previewRes?.data) ? previewRes.data : [];
        this.buildCurriculum(previewLessons);
        this.buildResources(previewLessons);

        this.isEnrolled = enrollmentRes?.data === true || enrollmentRes === true;
        this.checkingEnrollment = false;

        const enrollments = Array.isArray(enrollmentsByStudentRes?.data) ? enrollmentsByStudentRes.data : [];
        const activeEnrollment = enrollments.find(
          (item: any) => Number(item.courseId) === Number(this.course.id),
        );
        const progress = Number(activeEnrollment?.progressPercent ?? 0);
        this.progressPercent = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
        this.completedLessons = Math.floor((this.totalLessons * this.progressPercent) / 100);

        this.cdr.detectChanges();
      },
      error: () => {
        this.checkingEnrollment = false;
        this.cdr.detectChanges();
      },
    });
  }

  protected enroll() {
    const uid = this.authService.userId();
    if (!uid) { 
      this.enrollMsg = 'Please sign in to enroll.'; 
      this.cdr.detectChanges();
      return; 
    }
    
    // Explicitly resolve courseId from route or course object
    const courseIdFromRoute = Number(this.route.snapshot.paramMap.get('courseId'));
    const courseId = courseIdFromRoute || this.course.id;
    
    if (!courseId) {
      this.enrollMsg = 'Course ID not found. Please refresh and try again.';
      this.cdr.detectChanges();
      return;
    }

    this.enrolling = true; 
    
    const priceStr = String(this.course.price || '0').toLowerCase();
    const isFree = priceStr === 'free' || priceStr === '0' || priceStr === '0.00';
    let numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    if (isNaN(numericPrice) || numericPrice < 0) numericPrice = 0;
    
    if (isFree || numericPrice === 0) {
      this.enrollMsg = 'Enrolling you in the free course...';
      this.cdr.detectChanges();
      
      this.apiService.enroll(uid, courseId).subscribe({
        next: (res: any) => this.handleSuccessEnrollment(courseId),
        error: (err: any) => this.handleErrorEnrollment(err, courseId)
      });
      return;
    }

    this.enrollMsg = 'Initializing payment...';
    this.cdr.detectChanges();

    // Fetch Razorpay key first
    this.apiService.getRazorpayKey().subscribe({
      next: (keyRes) => {
        // Handle wrapped/unwrapped response
        const razorpayKey = keyRes?.data?.keyId ?? keyRes?.keyId;
        
        if (!razorpayKey) {
          this.enrollMsg = 'Failed to fetch payment configuration (Key not found).';
          this.enrolling = false;
          this.cdr.detectChanges();
          return;
        }

        // Create Order
        this.apiService.createPaymentOrder(uid, courseId, numericPrice).subscribe({
          next: (orderRes) => {
             // Handle wrapped/unwrapped order response
             const order = orderRes?.data ?? orderRes;
             
             if (!order?.orderId) {
               this.enrollMsg = 'Failed to initialize order (ID missing).';
               this.enrolling = false;
               this.cdr.detectChanges();
               return;
             }

             this.enrollMsg = 'Awaiting payment...';
             this.cdr.detectChanges();

             const options = {
               key: razorpayKey,
               amount: Number(order.amount),
               currency: order.currency || 'INR',
               name: 'Edulearn',
               description: `Enroll in ${this.course.title}`,
               order_id: order.orderId,
               prefill: {
                 name: 'Student ' + uid,
                 contact: '9999999999',
                 email: 'student@edulearn.com'
               },
               handler: (response: any) => {
                 this.enrollMsg = 'Verifying payment...';
                 this.cdr.detectChanges();

                 const verifyData = {
                   razorpayOrderId: response.razorpay_order_id,
                   razorpayPaymentId: response.razorpay_payment_id,
                   razorpaySignature: response.razorpay_signature,
                   studentId: uid.toString(),
                   courseId: courseId.toString()
                 };

                 this.apiService.verifyPayment(verifyData).subscribe({
                   next: (verifyRes: any) => {
                     // Check for success in wrapped/unwrapped response
                     const status = verifyRes?.data?.status ?? verifyRes?.status;
                     if (status === 'SUCCESS') {
                       this.handleSuccessEnrollment(courseId);
                     } else {
                       this.enrollMsg = 'Payment verification returned unsuccessful status.';
                       this.enrolling = false;
                       this.cdr.detectChanges();
                     }
                   },
                   error: (verifyErr) => {
                     this.enrollMsg = 'Payment verification failed on server.';
                     this.enrolling = false;
                     this.cdr.detectChanges();
                     console.error('Verify error:', verifyErr);
                   }
                 });
               },
               modal: {
                 ondismiss: () => {
                   this.enrollMsg = 'Payment was cancelled.';
                   this.enrolling = false;
                   this.cdr.detectChanges();
                 }
               }
             };
             const rzp = new Razorpay(options);
             rzp.open();
          },
          error: (err) => {
             this.enrollMsg = 'Failed to create payment order.';
             this.enrolling = false;
             this.cdr.detectChanges();
             console.error('Create order error:', err);
          }
        });
      },
      error: (err) => {
        this.enrollMsg = 'Failed to initialize payment gateway.';
        this.enrolling = false;
        this.cdr.detectChanges();
        console.error('Key fetch error:', err);
      }
    });
  }

  private handleSuccessEnrollment(courseId: number) {
    this.isEnrolled = true; 
    this.enrolling = false; 
    this.enrollMsg = 'Successfully enrolled! Redirecting to your lessons...'; 
    this.cdr.detectChanges();
    setTimeout(() => {
      this.router.navigate(['/course', courseId, 'lesson', this.firstLessonId]).then(navSuccess => {
        if (!navSuccess) {
          console.error('Navigation to lesson failed');
          this.router.navigateByUrl(`/course/${courseId}/lesson/${this.firstLessonId}`);
        }
      });
    }, 1500);
  }

  private handleErrorEnrollment(err: any, courseId: number) {
    this.enrolling = false; 
    const errMsg = err?.error?.message ?? '';
    
    // If they are already enrolled, treat it as success for navigation purposes
    if (errMsg.toLowerCase().includes('enrolled')) {
      this.isEnrolled = true;
      this.enrollMsg = 'You are already enrolled! Redirecting to your lessons...';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.router.navigate(['/course', courseId, 'lesson', this.firstLessonId]);
      }, 1500);
      return;
    }

    this.enrollMsg = errMsg || 'Enrollment failed. Please try again.'; 
    this.cdr.detectChanges();
    console.error('Enrollment error:', err);
  }

  protected toggleSection(sectionId: number): void {
    this.expandedSection = this.expandedSection === sectionId ? -1 : sectionId;
  }

  protected isLessonActive(sectionId: number, lessonId: number): boolean {
    // This could be updated to track the currently playing lesson id
    return this.expandedSection === sectionId;
  }

  protected openLesson(lessonId: number): void {
    if (!lessonId || !this.course?.id) return;
    this.router.navigate(['/course', this.course.id, 'lesson', lessonId]);
  }

  protected postThread() {
    const uid = this.authService.userId();
    if (!uid) {
      alert('Please sign in to participate in the discussion.');
      return;
    }
    const cId = Number(this.route.snapshot.paramMap.get('courseId')) || this.course.id;
    if (!cId || !this.newThreadBody.trim()) return;

    this.postingThread = true;
    this.apiService.createThread({
      courseId: cId,
      authorId: uid,
      title: 'Question from Student',
      body: this.newThreadBody
    }).subscribe({
      next: (thread) => {
        this.postingThread = false;
        this.newThreadBody = '';
        this.discussionThreads.unshift({
          ...thread,
          authorName: 'You'
        });
      },
      error: (err) => {
        this.postingThread = false;
        console.error('Failed to post thread', err);
        alert('Failed to post discussion. Please try again.');
      }
    });
  }

  private buildCurriculum(lessons: any[]): void {
    if (!lessons.length) {
      this.curriculum = [];
      this.totalLessons = 0;
      this.allLessons = [];
      return;
    }

    const sectionsMap = new Map<string, any[]>();
    lessons.forEach((lesson: any, index: number) => {
      const sectionName = lesson?.sectionTitle || lesson?.section || 'Course Lessons';
      const sectionLessons = sectionsMap.get(sectionName) ?? [];
      sectionLessons.push({
        id: lesson?.lessonId ?? lesson?.id ?? index + 1,
        title: lesson?.title ?? `Lesson ${index + 1}`,
        duration: lesson?.duration ?? `${lesson?.durationMinutes ?? 0} min`,
        free: lesson?.isPreview === true || lesson?.isFree === true,
      });
      sectionsMap.set(sectionName, sectionLessons);
    });

    let sectionCounter = 1;
    this.curriculum = Array.from(sectionsMap.entries()).map(([title, sectionLessons]) => ({
      id: sectionCounter++,
      title,
      lessons: sectionLessons,
    }));
    this.expandedSection = this.curriculum[0]?.id ?? -1;

    this.allLessons = lessons.map((lesson: any, index: number) => ({
      id: lesson?.lessonId ?? lesson?.id ?? index + 1,
      title: lesson?.title ?? `Lesson ${index + 1}`,
      duration: lesson?.durationMinutes ?? lesson?.duration ?? 0,
      type: lesson?.type ?? 'Video',
      completed: false,
    }));
    this.totalLessons = this.allLessons.length;
    this.firstLessonId = Number(this.allLessons[0]?.id ?? 1);
  }

  private buildResources(lessons: any[]): void {
    const resources: Array<{ id: number; icon: string; title: string; meta: string }> = [];
    lessons.forEach((lesson: any, lessonIndex: number) => {
      const lessonResources = Array.isArray(lesson?.resources) ? lesson.resources : [];
      lessonResources.forEach((resource: any, resourceIndex: number) => {
        resources.push({
          id: Number(`${lessonIndex + 1}${resourceIndex + 1}`),
          icon: '📄',
          title: resource?.name ?? resource?.title ?? `Resource ${resourceIndex + 1}`,
          meta: resource?.type ?? 'Course resource',
        });
      });
    });

    this.resourceItems = resources.length
      ? resources
      : [{ id: 1, icon: '📚', title: 'No lesson resources published yet', meta: 'Resources will appear here' }];
  }
}
