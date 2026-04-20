import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-explore',
  imports: [RouterLink],
  template: `
    <div class="explore-shell">
      <div class="el-grain"></div>

      <!-- NAVBAR -->
      <header class="explore-topbar">
        <a routerLink="/" class="brand-mark brand-link">EDULEARN</a>
        <nav class="landing-nav" aria-label="Primary">
          <a routerLink="/" class="el-nav-link">Home</a>
          <a routerLink="/explore" class="el-nav-link">Courses</a>
          <a routerLink="/about" class="el-nav-link">About</a>
        </nav>
        @if (auth.isLoggedIn()) {
          <a [routerLink]="'/' + auth.user()?.role?.toLowerCase() + (auth.user()?.role === 'ADMIN' ? '' : '/profile')" class="topbar-signin">Profile</a>
        } @else {
          <a routerLink="/auth" class="topbar-signin">Sign In</a>
        }
      </header>

      <!-- INTRO SECTION -->
      <section class="explore-intro">
        <div class="el-grain"></div>
        <div class="intro-content">
          <h1 class="intro-title">Find your learning journey</h1>

          <!-- SEARCH & FILTERS HEADER -->
          <div class="explore-controls">
            <div class="search-box">
              <input type="text" class="search-input" placeholder="Search courses..." (input)="onSearch($event)" />
              <span class="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
            </div>

            <div class="filter-dropdowns">
              <div class="result-count">
                {{ courses().length }} courses
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MAIN CONTENT -->
      <section class="explore-content">
        <!-- SIDEBAR FILTERS -->
        <aside class="explore-sidebar">
          <!-- Category Filter -->
          <div class="filter-group">
            <h3 class="filter-title">Category</h3>
            <div class="filter-options">
              @for (category of categories; track category) {
                <label class="filter-checkbox">
                  <input type="checkbox" [checked]="selectedCategory === category" (change)="onCategoryChange(category)" />
                  <span>{{ category }}</span>
                </label>
              }
            </div>
          </div>
        </aside>

        <!-- COURSES GRID -->
        <main class="explore-main">
          <div class="courses-header">
            <h2 class="courses-title">{{ selectedCategory === 'All' ? 'All Courses' : selectedCategory }}</h2>
            <div class="sort-options">
              {{ courses().length }} results
            </div>
          </div>

          @if (loading()) {
            <div class="explore-grid">
              <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p class="page-copy">Loading courses…</p>
              </div>
            </div>
          } @else {
            <div class="explore-grid">
              @for (course of courses(); track course.courseId) {
                <a [routerLink]="['/course', course.courseId]" class="el-card explore-card">
                  <div
                    class="course-visual"
                    [style.background-image]="course.thumbnailUrl ? 'url(' + course.thumbnailUrl + ')' : null"
                  ></div>
                  <div class="course-body">
                    <div class="course-meta-top">
                      <span class="course-level">{{ course.level }}</span>
                      <span class="course-date">{{ course.category }}</span>
                    </div>
                    <h3 class="course-title">{{ course.title }}</h3>
                    <p class="course-description">{{ course.description }}</p>

                    <div class="course-footer">
                      <div class="course-instructor">
                        <div class="student-count">{{ course.language || 'English' }}</div>
                      </div>
                      <div class="course-price">{{ course.price === 0 ? 'Free' : '₹' + course.price }}</div>
                    </div>
                  </div>
                </a>
              }

              @if (courses().length === 0) {
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                  <p class="page-copy">No courses found. Try a different search term or category.</p>
                </div>
              }
            </div>
          }
        </main>
      </section>
    </div>
  `,
})
export class ExploreComponent implements OnInit, OnDestroy {
  protected readonly categories = ['All', 'Design', 'Development', 'Business', 'Marketing', 'Data Science'];
  protected selectedCategory = 'All';
  protected readonly courses = signal<any[]>([]);
  protected readonly loading = signal(true);

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() {
    this.loadAllCourses();

    this.searchSub = this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(keyword => {
        if (keyword.trim()) {
          this.loading.set(true);
          this.api.searchCourses(keyword).subscribe({
            next: (res: any) => {
              this.courses.set(res.data || []);
              this.loading.set(false);
            },
            error: () => { this.loading.set(false); },
          });
        } else {
          this.loadAllCourses();
        }
      });
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.loading.set(true);
    if (category === 'All') {
      this.loadAllCourses();
    } else {
      this.api.getCoursesByCategory(category).subscribe({
        next: (res: any) => {
          this.courses.set(res.data || []);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); },
      });
    }
  }

  private loadAllCourses() {
    this.loading.set(true);
    this.api.getAllCourses().subscribe({
      next: (res: any) => {
        this.courses.set(res.data || []);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }
}
