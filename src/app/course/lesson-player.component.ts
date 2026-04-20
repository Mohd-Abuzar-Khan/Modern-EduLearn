import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-lesson-player',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <header class="page-header">
        <a [routerLink]="['/course', courseId]" class="back-link">← Back to Course</a>
        <nav class="header-nav">
          <a routerLink="/">Home</a>
          <a routerLink="/explore">Courses</a>
          <a routerLink="/">About</a>
        </nav>
      </header>

      <!-- Main Scrollable Content -->
      <div class="page-scroll-container">
        <div class="page-content-layout">
          <!-- Sidebar: Lesson List -->
          <aside class="lesson-sidebar glass-card">
            <h2 class="sidebar-title">Course Content</h2>
            <div class="sidebar-meta">{{ lessons().length }} lessons</div>

            @if (lessonsLoading()) {
              <p class="page-copy" style="padding: 1rem; font-size: 0.85rem;">Loading lessons…</p>
            } @else {
              <div class="sidebar-lesson-list">
                @for (lesson of lessons(); track lesson.lessonId) {
                  <button class="sidebar-lesson-row"
                          [class.sidebar-lesson-row--active]="lesson.lessonId === currentLessonId"
                          (click)="navigateToLesson(lesson.lessonId)">
                    <span class="sidebar-lesson-status" [class.sidebar-lesson-status--done]="lessonCompletionMap()[lesson.lessonId]">
                      {{ lessonCompletionMap()[lesson.lessonId] ? '✓' : '▶' }}
                    </span>
                    <span class="sidebar-lesson-text">
                      <strong>{{ lesson.title }}</strong>
                      <small>{{ lesson.durationMinutes }} min · {{ lesson.contentType }}</small>
                    </span>
                  </button>
                }
              </div>
            }

            <!-- Course Progress Bar -->
            @if (courseProgressPercent() >= 0) {
              <div class="sidebar-progress">
                <div class="sidebar-progress-label">
                  <span>Progress</span>
                  <span>{{ courseProgressPercent() }}%</span>
                </div>
                <div class="sidebar-progress-bar">
                  <div class="sidebar-progress-fill" [style.width.%]="courseProgressPercent()"></div>
                </div>
              </div>
            }
          </aside>

          <!-- Main Content -->
          <div class="page-content">
            <!-- Video Player -->
            <section class="video-container glass-card">
              @if (currentLesson()) {
                @if (normalizeType(currentLesson().contentType, currentLesson().contentUrl) === 'VIDEO') {
                  <video class="video-player" [src]="resolveMediaUrl(currentLesson().contentUrl)" controls>
                    Your browser does not support the video tag.
                  </video>
                } @else if (normalizeType(currentLesson().contentType, currentLesson().contentUrl) === 'PDF') {
                  <iframe class="content-iframe" [src]="resolveMediaUrl(currentLesson().contentUrl)" frameborder="0"></iframe>
                  <div class="pdf-download-bar">
                    <span>PDF Document</span>
                    <a [href]="resolveMediaUrl(currentLesson().contentUrl)"
                       target="_blank"
                       download
                       class="pdf-download-btn">
                      ⬇ Download PDF
                    </a>
                  </div>
                } @else if (normalizeType(currentLesson().contentType, currentLesson().contentUrl) === 'VIDEO_URL') {
                  <iframe class="content-iframe" [src]="safeVideoUrl(currentLesson().contentUrl)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; aspect-ratio:16/9;"></iframe>
                } @else {
                  <div class="article-panel">
                    <div class="video-box" style="background: linear-gradient(135deg, #2f5531 0%, #5d8b5f 45%, #d8e7c3 100%);">
                      <span class="play-text">{{ currentLesson().contentType }} content</span>
                      <a *ngIf="currentLesson().contentUrl" [href]="currentLesson().contentUrl" target="_blank" class="play-btn" style="text-decoration:none;font-size:1rem;margin-top:1rem;width:auto;height:auto;padding:0.5rem 1rem;">Open in new tab</a>
                    </div>
                  </div>
                }
              } @else {
                <div class="video-box" style="background: linear-gradient(135deg, #2f5531 0%, #5d8b5f 45%, #d8e7c3 100%);">
                  <button class="play-btn" aria-label="Play video">▶</button>
                  <span class="play-text">Select a lesson to start</span>
                </div>
              }
            </section>

            <!-- Lesson Info -->
            <section class="lesson-info glass-card">
              <div class="badges">
                @if (currentLesson()) {
                  <span>{{ currentLesson().contentType }}</span>
                  <span>{{ currentLesson().durationMinutes }} min</span>
                  <span>Lesson {{ currentLessonIndex() + 1 }} of {{ lessons().length }}</span>
                }
              </div>
              <h1>{{ currentLesson()?.title || 'Loading…' }}</h1>
              <p>{{ currentLesson()?.description || '' }}</p>
            </section>

            <!-- Tabs -->
            <section class="tabs-container">
              <div class="tab-buttons">
                <button [class.active]="activeTab === 'resources'" (click)="activeTab = 'resources'">
                  Resources
                </button>
                <button [class.active]="activeTab === 'discussion'" (click)="activeTab = 'discussion'">
                  Discussion
                </button>
              </div>

              @if (activeTab === 'resources') {
                <div class="tab-panel glass-card">
                  <h2 style="font-size: 1.1rem; margin-bottom: 1.2rem;">Lesson Resources</h2>
                  <div class="resource-list" style="display: grid; gap: 0.85rem;">
                    <!-- We check for empty resources here. Since there's no dynamic list in the template yet, I'll add a placeholder empty state -->
                    <div class="soft-card" style="padding: 2.5rem 1.5rem; text-align: center; border-radius: 20px; display: grid; gap: 1rem; place-items: center; background: rgba(255,255,255,0.03);">
                      <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.06); display: grid; place-items: center; color: var(--el-text-muted);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                      </div>
                      <div>
                        <h3 style="margin: 0; font-size: 1.05rem; font-weight: 500; color: var(--el-text-primary);">No learning resources published yet</h3>
                        <p class="page-copy" style="font-size: 0.85rem; margin-top: 0.35rem; opacity: 0.7;">Materials like PDFs and code samples will appear here.</p>
                      </div>
                    </div>
                  </div>
                </div>
              }

              @if (activeTab === 'discussion') {
                <div class="tab-panel glass-card">
                  <h2>Discussion</h2>

                  <div style="margin-bottom: 1rem;">
                    <textarea class="el-input" rows="2" [(ngModel)]="newThreadBody" placeholder="Start a new discussion for this course..."></textarea>
                    <button class="el-btn" style="margin-top: 0.5rem; padding: 0.5rem 1rem;"
                            (click)="postThread()"
                            [disabled]="!newThreadBody.trim() || postingThread">
                      {{ postingThread ? 'Posting...' : 'Post' }}
                    </button>
                  </div>

                  <div class="resource-list" style="max-height: 400px; overflow-y: auto;">
                    @if (discussionThreads.length === 0) {
                      <p class="page-copy" style="font-size: 0.9rem;">No discussions yet. Start one!</p>
                    }

                    @for (thread of discussionThreads; track thread.threadId) {
                      <div class="resource-item soft-card" style="display:flex; flex-direction:column; gap:0.3rem;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                          <strong style="color:var(--el-text-primary);">{{ thread.authorName || 'Guest Student' }}</strong>
                          <span style="font-size: 0.75rem; color: var(--el-text-muted);">
                            {{ thread.createdAt ? (thread.createdAt | date:'short') : 'Just now' }}
                          </span>
                        </div>
                        @if (thread.title && thread.title.trim()) {
                          <span style="font-weight:600; color:var(--el-accent); font-size:0.85rem;">{{ thread.title }}</span>
                        }
                        <span style="color:var(--el-text-secondary); font-size: 0.85rem; line-height: 1.4;">{{ thread.body }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </section>

            <!-- Lesson Navigation -->
            <section class="lesson-nav-section">
              <button
                class="nav-btn prev-btn"
                [disabled]="!hasPrevLesson()"
                (click)="goToPrevLesson()">
                ← Previous Lesson
              </button>
              <div style="display:flex;flex-direction:column;align-items:center;gap:0.4rem;">
                @if (!lessonCompleted) {
                  <button class="nav-btn" style="background:rgba(106,170,106,0.18);border-color:rgba(106,170,106,0.4);"
                    (click)="markComplete()" [disabled]="completingLesson">
                    {{ completingLesson ? 'Saving…' : '✓ Mark Complete' }}
                  </button>
                } @else {
                  <span style="font-size:0.85rem;color:#6aaa6a;">✓ Completed</span>
                }
                @if (completeMsg) { <span style="font-size:0.78rem;color:#6aaa6a;">{{ completeMsg }}</span> }
              </div>
              <button
                class="nav-btn next-btn"
                [disabled]="!hasNextLesson()"
                (click)="goToNextLesson()">
                Next Lesson →
              </button>
            </section>

            <!-- Certificate Celebration Banner -->
            @if (showCertBanner) {
              <section class="cert-banner glass-card">
                <div class="cert-banner-content">
                  <span class="cert-banner-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6aaa6a" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </span>
                  <div>
                    <h3>Congratulations! Course Completed!</h3>
                    <p>Your certificate has been generated. You can view it on the Certificates page.</p>
                  </div>
                  <a routerLink="/student/certificates" class="cert-banner-btn">View Certificate →</a>
                  <button class="cert-banner-close" (click)="showCertBanner = false">✕</button>
                </div>
              </section>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    * { box-sizing: border-box; }

    .page-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background: transparent;
    }

    .page-header {
      flex-shrink: 0;
      padding: 1rem 2rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(12px);
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .back-link {
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      color: var(--el-text-primary);
      text-decoration: none;
      font-size: 0.9rem;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-link:hover { background: rgba(255,255,255,0.15); }

    .header-nav {
      display: flex;
      gap: 2rem;
      flex: 1;
      justify-content: center;
    }

    .header-nav a {
      color: var(--el-text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
      cursor: pointer;
    }

    .header-nav a:hover { color: var(--el-text-primary); }

    .page-scroll-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 2rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(106,170,106,0.3) transparent;
    }

    .page-content-layout {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Sidebar */
    .lesson-sidebar {
      border-radius: 16px;
      padding: 1rem;
      position: sticky;
      top: 0;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
      scrollbar-width: thin;
    }

    .sidebar-title {
      font-size: 1.1rem;
      margin: 0 0 0.3rem 0;
    }

    .sidebar-meta {
      font-size: 0.8rem;
      color: var(--el-text-muted);
      margin-bottom: 0.8rem;
    }

    .sidebar-lesson-list {
      display: grid;
      gap: 0.3rem;
    }

    .sidebar-lesson-row {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem;
      border-radius: 10px;
      border: none;
      background: transparent;
      text-align: left;
      color: var(--el-text-secondary);
      cursor: pointer;
      transition: background 0.2s;
    }

    .sidebar-lesson-row:hover { background: rgba(255,255,255,0.06); }

    .sidebar-lesson-row--active {
      background: rgba(106,170,106,0.14);
      color: var(--el-text-primary);
    }

    .sidebar-lesson-status {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      background: rgba(255,255,255,0.09);
      color: var(--el-text-secondary);
      font-size: 0.65rem;
    }

    .sidebar-lesson-status--done {
      background: rgba(106,170,106,0.2);
      color: #6aaa6a;
    }

    .sidebar-lesson-text {
      display: grid;
      gap: 0.1rem;
      flex: 1;
      min-width: 0;
    }

    .sidebar-lesson-text strong {
      font-size: 0.82rem;
      font-weight: 500;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-lesson-text small {
      font-size: 0.72rem;
      color: var(--el-text-muted);
    }

    /* Sidebar Progress */
    .sidebar-progress {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .sidebar-progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--el-text-secondary);
      margin-bottom: 0.4rem;
    }

    .sidebar-progress-bar {
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      height: 6px;
      overflow: hidden;
    }

    .sidebar-progress-fill {
      background: #6aaa6a;
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    /* Main Content */
    .page-content {
      display: grid;
      gap: 1.5rem;
    }

    .video-container { border-radius: 16px; overflow: hidden; }

    .video-player, .content-iframe {
      width: 100%;
      height: 400px;
      display: block;
      background: #000;
    }

    .video-box {
      width: 100%;
      height: 400px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 0.5rem;
    }

    .play-btn {
      width: 70px; height: 70px; border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      color: white; font-size: 28px; cursor: pointer;
      transition: all 0.3s; z-index: 10;
    }

    .play-btn:hover { background: rgba(255,255,255,0.25); transform: scale(1.1); }

    .play-text { font-size: 0.85rem; opacity: 0.7; }

    /* PDF Download Bar */
    .pdf-download-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.2rem;
      background: rgba(255,255,255,0.06);
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .pdf-download-bar span {
      font-size: 0.85rem;
      color: var(--el-text-secondary);
    }

    .pdf-download-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      background: rgba(106,170,106,0.2);
      border: 1px solid rgba(106,170,106,0.35);
      border-radius: 8px;
      color: #6aaa6a;
      font-size: 0.85rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pdf-download-btn:hover {
      background: rgba(106,170,106,0.3);
      transform: translateY(-1px);
    }

    .lesson-info { padding: 2rem; border-radius: 16px; }

    .badges {
      display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1rem;
    }

    .badges span {
      padding: 0.4rem 0.8rem;
      background: rgba(106,170,106,0.15);
      border: 1px solid rgba(106,170,106,0.25);
      border-radius: 8px; font-size: 0.75rem;
      color: var(--el-accent); font-weight: 500;
    }

    .lesson-info h1 { font-size: 1.8rem; margin: 1rem 0 0.8rem 0; line-height: 1.3; }

    .lesson-info p {
      font-size: 0.95rem; color: var(--el-text-secondary);
      line-height: 1.6; margin-bottom: 1rem;
    }

    .tabs-container { border-radius: 16px; overflow: hidden; }

    .tab-buttons {
      display: flex; gap: 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
    }

    .tab-buttons button {
      padding: 1rem 1.5rem; background: transparent;
      border: none; border-bottom: 2px solid transparent;
      color: var(--el-text-secondary); font-size: 0.9rem;
      cursor: pointer; transition: all 0.2s; white-space: nowrap;
    }

    .tab-buttons button:hover { color: var(--el-text-primary); }
    .tab-buttons button.active { color: var(--el-accent); border-bottom-color: var(--el-accent); }

    .tab-panel { padding: 2rem; border-radius: 0 0 16px 16px; }
    .tab-panel h2 { font-size: 1.2rem; margin: 0 0 1.5rem 0; }

    .resource-list { display: grid; gap: 0.8rem; }

    .resource-item {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem; border-radius: 12px; transition: all 0.2s;
    }

    .resource-item:hover { background: rgba(255,255,255,0.1); }
    .resource-item .icon { font-size: 1.4rem; flex-shrink: 0; }
    .resource-item .details { flex: 1; display: grid; gap: 0.25rem; }
    .resource-item .details strong { font-size: 0.9rem; display: block; }
    .resource-item .details span { font-size: 0.75rem; color: var(--el-text-muted); }

    .download-btn {
      width: 36px; height: 36px; border-radius: 8px;
      background: rgba(106,170,106,0.15);
      border: 1px solid rgba(106,170,106,0.25);
      color: var(--el-accent); font-size: 1rem;
      cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    }

    .download-btn:hover { background: rgba(106,170,106,0.25); transform: scale(1.05); }

    .lesson-nav-section {
      display: grid; grid-template-columns: 1fr auto 1fr;
      gap: 1rem; margin-top: 1rem; align-items: center;
    }

    .nav-btn {
      padding: 0.9rem 1.5rem;
      background: rgba(106, 170, 106, 0.15);
      border: 1px solid rgba(106, 170, 106, 0.3);
      border-radius: 10px;
      color: var(--el-accent); font-size: 0.9rem;
      font-weight: 500; cursor: pointer; transition: all 0.3s;
    }

    .nav-btn:hover:not(:disabled) {
      background: rgba(106, 170, 106, 0.25);
      border-color: rgba(106, 170, 106, 0.5);
      transform: translateY(-2px);
    }

    .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .next-btn { text-align: right; justify-self: end; }

    /* Certificate Celebration Banner */
    .cert-banner {
      border-radius: 16px;
      padding: 1.5rem;
      background: rgba(106,170,106,0.12);
      border: 1px solid rgba(106,170,106,0.3);
      animation: slideDown 0.4s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .cert-banner-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .cert-banner-icon { font-size: 2rem; }

    .cert-banner-content h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #6aaa6a;
    }

    .cert-banner-content p {
      margin: 0.2rem 0 0;
      font-size: 0.85rem;
      color: var(--el-text-secondary);
    }

    .cert-banner-btn {
      margin-left: auto;
      padding: 0.6rem 1.2rem;
      background: rgba(106,170,106,0.25);
      border: 1px solid rgba(106,170,106,0.4);
      border-radius: 8px;
      color: #6aaa6a;
      font-weight: 600;
      font-size: 0.85rem;
      text-decoration: none;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .cert-banner-btn:hover {
      background: rgba(106,170,106,0.35);
      transform: translateY(-1px);
    }

    .cert-banner-close {
      background: none;
      border: none;
      color: var(--el-text-muted);
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0.3rem;
      transition: color 0.2s;
    }

    .cert-banner-close:hover { color: var(--el-text-primary); }

    @media (max-width: 900px) {
      .page-content-layout {
        grid-template-columns: 1fr;
      }
      .lesson-sidebar {
        position: static;
        max-height: 300px;
      }
    }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; padding: 0.75rem 1rem; gap: 0.75rem; }
      .back-link { width: 100%; text-align: center; }
      .header-nav { width: 100%; gap: 0.5rem; font-size: 0.85rem; }
      .page-scroll-container { padding: 1rem; }
      .video-player, .content-iframe, .video-box { height: 240px; }
      .play-btn { width: 50px; height: 50px; font-size: 20px; }
      .lesson-info { padding: 1rem; }
      .lesson-info h1 { font-size: 1.4rem; }
      .tab-buttons button { padding: 0.75rem 1rem; font-size: 0.85rem; }
      .tab-panel { padding: 1rem; }
      .lesson-nav-section { grid-template-columns: 1fr; }
      .cert-banner-content { flex-direction: column; text-align: center; }
      .cert-banner-btn { margin-left: 0; }
    }
  `,
})
export class LessonPlayerComponent implements OnInit, OnDestroy {
  private readonly backendOrigin = (environment.backendOrigin || environment.apiBaseUrl || '').replace(/\/$/, '');

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  protected activeTab = 'resources';
  protected courseId = 1;
  protected currentLessonId = 1;
  protected lessonCompleted = false;
  protected completingLesson = false;
  protected completeMsg = '';
  protected showCertBanner = false;
  private watchStartTime = Date.now();
  private progressTimer: any;

  protected readonly lessons = signal<any[]>([]);
  protected readonly lessonsLoading = signal(true);
  protected readonly lessonCompletionMap = signal<Record<number, boolean>>({});
  protected readonly courseProgressPercent = signal(-1);

  protected readonly currentLesson = signal<any>(null);
  protected readonly currentLessonIndex = signal(0);

  protected hasPrevLesson = signal(false);
  protected hasNextLesson = signal(false);

  // Discussion state
  protected discussionThreads: any[] = [];
  protected newThreadBody = '';
  protected postingThread = false;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.courseId = parseInt(params['courseId'], 10);
      this.currentLessonId = parseInt(params['lessonId'], 10) || 1;
      this.loadLessons();
      this.loadDiscussion();
      this.loadCourseProgress();
    });
    // Auto-track every 30s
    this.progressTimer = setInterval(() => this.saveProgress(), 30000);
  }

  private loadDiscussion() {
    this.apiService.getThreadsByCourse(this.courseId).subscribe({
      next: (data: any[]) => this.discussionThreads = Array.isArray(data) ? data : [],
      error: (e) => console.error('Failed to load discussion:', e)
    });
  }

  ngOnDestroy() {
    clearInterval(this.progressTimer);
    this.saveProgress();
  }

  private loadLessons() {
    this.lessonsLoading.set(true);
    this.apiService.getLessonsByCourse(this.courseId).subscribe({
      next: (res: any) => {
        const lessonList = res.data || res || [];
        this.lessons.set(lessonList);
        this.lessonsLoading.set(false);
        this.updateCurrentLesson();
        this.loadCompletionStatus(lessonList);
      },
      error: () => {
        this.lessonsLoading.set(false);
      },
    });
  }

  private loadCourseProgress() {
    const uid = this.authService.userId();
    if (!uid) return;
    this.apiService.getCourseProgress(uid, this.courseId).subscribe({
      next: (res: any) => {
        const pct = typeof res === 'number' ? res : (res?.data ?? res?.progressPercentage ?? -1);
        this.courseProgressPercent.set(pct);
      },
      error: () => {}
    });
  }

  private updateCurrentLesson() {
    const all = this.lessons();
    const idx = all.findIndex(l => l.lessonId === this.currentLessonId);
    if (idx >= 0) {
      this.currentLesson.set(all[idx]);
      this.currentLessonIndex.set(idx);
      this.hasPrevLesson.set(idx > 0);
      this.hasNextLesson.set(idx < all.length - 1);
    } else if (all.length > 0) {
      // lessonId not found, default to first
      this.currentLessonId = all[0].lessonId;
      this.currentLesson.set(all[0]);
      this.currentLessonIndex.set(0);
      this.hasPrevLesson.set(false);
      this.hasNextLesson.set(all.length > 1);
    }
    this.watchStartTime = Date.now();
    this.lessonCompleted = false;
    this.completeMsg = '';

    // Check if current lesson is already completed
    const map = this.lessonCompletionMap();
    if (map[this.currentLessonId]) {
      this.lessonCompleted = true;
    }
  }

  private loadCompletionStatus(lessonList: any[]) {
    const uid = this.authService.userId();
    if (!uid) return;
    const map: Record<number, boolean> = {};
    lessonList.forEach(l => {
      this.apiService.getLessonProgress(uid, l.lessonId).subscribe({
        next: (res: any) => {
          if (res?.isCompleted || res?.data?.isCompleted) {
            map[l.lessonId] = true;
            this.lessonCompletionMap.set({ ...map });
            // If current lesson, mark as completed
            if (l.lessonId === this.currentLessonId) {
              this.lessonCompleted = true;
            }
          }
        },
        error: () => {},
      });
    });
  }

  protected navigateToLesson(lessonId: number) {
    this.saveProgress();
    this.currentLessonId = lessonId;
    this.updateCurrentLesson();
    this.router.navigate(['/course', this.courseId, 'lesson', lessonId]);
  }

  protected goToPrevLesson() {
    const idx = this.currentLessonIndex();
    if (idx > 0) {
      this.navigateToLesson(this.lessons()[idx - 1].lessonId);
    }
  }

  protected goToNextLesson() {
    const all = this.lessons();
    const idx = this.currentLessonIndex();
    if (idx < all.length - 1) {
      this.navigateToLesson(all[idx + 1].lessonId);
    }
  }

  private saveProgress() {
    const uid = this.authService.userId();
    if (!uid) return;
    const watchedSeconds = Math.floor((Date.now() - this.watchStartTime) / 1000);
    if (watchedSeconds < 5) return;
    this.apiService.trackProgress(uid, this.courseId, this.currentLessonId, watchedSeconds).subscribe({ error: () => {} });
  }

  protected markComplete() {
    const uid = this.authService.userId();
    if (!uid) return;
    this.completingLesson = true;
    this.apiService.markLessonComplete(uid, this.courseId, this.currentLessonId).subscribe({
      next: (res: any) => {
        this.lessonCompleted = true;
        this.completingLesson = false;
        this.completeMsg = 'Lesson marked complete!';
        const map = { ...this.lessonCompletionMap() };
        map[this.currentLessonId] = true;
        this.lessonCompletionMap.set(map);

        // Update course progress from response
        if (res?.courseProgress != null) {
          this.courseProgressPercent.set(res.courseProgress);
        }

        // Check if course is completed and certificate was issued
        if (res?.courseCompleted && res?.certificateIssued) {
          this.showCertBanner = true;
          this.completeMsg = '🎉 Course completed! Certificate generated!';
        } else if (res?.courseProgress != null) {
          this.completeMsg = `Lesson complete! Course progress: ${res.courseProgress}%`;
        }
      },
      error: () => {
        this.completingLesson = false;
        this.completeMsg = 'Failed to mark complete.';
      },
    });
  }

  protected safeVideoUrl(url: string): SafeResourceUrl | string {
    if (!url) return '';
    let finalUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      finalUrl = url.replace('watch?v=', 'embed/');
      // Remove any extra query params after the video ID for clean embed
      const ampIdx = finalUrl.indexOf('&');
      if (ampIdx > -1) {
        finalUrl = finalUrl.substring(0, ampIdx);
      }
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      finalUrl = 'https://www.youtube.com/embed/' + videoId;
    } else if (url.includes('youtube.com/embed/')) {
      finalUrl = url; // already embed URL
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  }

  protected resolveMediaUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('/')) return `${this.backendOrigin}${url}`;
    return url.replace(/^https?:\/\/localhost:8083/, this.backendOrigin);
  }

  protected normalizeType(contentType: string | null | undefined, contentUrl?: string): string {
    const raw = (contentType ?? '').toString().trim().toUpperCase();
    const url = (contentUrl ?? '').toLowerCase();

    if (!raw) return 'VIDEO';

    // Auto-detect YouTube URLs even if contentType is set to VIDEO
    if ((raw === 'VIDEO' || raw === 'VIDEO_URL') && url &&
        (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com'))) {
      return 'VIDEO_URL';
    }

    if (raw === 'VIDEO' || raw === 'PDF' || raw === 'VIDEO_URL') return raw;
    if (raw === 'VIDEO-URL' || raw === 'YOUTUBE' || raw === 'EMBED') return 'VIDEO_URL';
    return raw;
  }

  protected postThread() {
    const uid = this.authService.userId();
    if (!uid) { alert('Please sign in to participate in the discussion.'); return; }
    if (!this.newThreadBody.trim()) return;

    this.postingThread = true;
    this.apiService.createThread({
      courseId: this.courseId,
      authorId: uid,
      title: 'Question from Lesson ' + (this.currentLessonIndex() + 1),
      body: this.newThreadBody
    }).subscribe({
      next: (thread) => {
        this.postingThread = false;
        this.newThreadBody = '';
        this.discussionThreads.unshift({ ...thread, authorName: 'You' });
      },
      error: (err) => {
        this.postingThread = false;
        console.error('Failed to post thread', err);
        alert('Failed to post discussion. Please try again.');
      }
    });
  }

  constructor() {}
}
