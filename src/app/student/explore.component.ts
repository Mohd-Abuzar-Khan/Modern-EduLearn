import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-student-explore',
  imports: [RouterLink],
  template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <div>
          <span class="pill">Course discovery</span>
          <h1 class="page-title" style="font-size: clamp(1.8rem, 3.2vw, 2.6rem); margin-top: 0.75rem;">Explore courses</h1>
          <p class="page-copy" style="margin-top: 0.35rem;">Search, sort, and filter the full catalog.</p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <input class="el-input" style="width: 230px; padding-block: 0.75rem;" type="search" placeholder="Search courses..." (input)="onSearch($event)" />
        </div>
      </div>

      <div class="explore-content" style="padding: 0; grid-template-columns: 260px minmax(0, 1fr); gap: 1rem;">
        <aside class="explore-sidebar" style="top: 0; max-height: none; position: relative;">
          <div class="filter-group" style="margin-bottom: 1rem; padding-bottom: 1rem;">
            <h3 class="filter-title">Category</h3>
            <div class="filter-options">
              @for (category of categories; track category) {
                <button class="explore-chip" [class.is-active]="selectedCategory() === category" type="button" (click)="onCategoryChange(category)">
                  {{ category }}
                </button>
              }
            </div>
          </div>

          <div class="filter-group" style="margin-bottom: 0; padding-bottom: 0; border: none;">
            <h3 class="filter-title">Level</h3>
            <div class="filter-options">
              @for (level of levels; track level) {
                <label class="filter-checkbox">
                  <input type="radio" name="level" [checked]="selectedLevel() === level" (change)="selectedLevel.set(level)" />
                  <span>{{ level }}</span>
                </label>
              }
            </div>
          </div>
        </aside>

        <div>
          <div class="courses-header">
            <h2 class="courses-title">Available courses</h2>
            <div class="sort-options">{{ filteredCourses().length }} results</div>
          </div>

          @if (loading()) {
            <div style="text-align: center; padding: 2rem;">
              <p class="page-copy">Loading courses...</p>
            </div>
          } @else {
            <div class="explore-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); width: 100%;">
              @for (course of filteredCourses(); track course.courseId) {
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
                        <div class="instructor-name">{{ course.language || 'English' }}</div>
                      </div>
                      <div class="course-price">{{ course.price === 0 ? 'Free' : '₹' + course.price }}</div>
                    </div>
                  </div>
                </a>
              }

              @if (filteredCourses().length === 0) {
                <article class="glass-card" style="padding: 1rem; border-radius: 18px; grid-column: 1 / -1;">
                  <h3 class="section-title" style="font-size: 1.1rem;">No matching courses</h3>
                  <p class="page-copy" style="margin-top: 0.35rem;">Try a different search term or reset the filters.</p>
                </article>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class StudentExploreComponent implements OnInit, OnDestroy {
  protected readonly categories = ['All', 'Design', 'Development', 'Business', 'Marketing', 'Data Science'];
  protected readonly levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  protected readonly selectedCategory = signal('All');
  protected readonly selectedLevel = signal('All');
  protected readonly courses = signal<any[]>([]);
  protected readonly loading = signal(true);

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  protected readonly filteredCourses = computed(() => {
    const level = this.selectedLevel();
    return this.courses().filter((course) => {
      const levelMatch = level === 'All' || course.level === level;
      return levelMatch;
    });
  });

  constructor(private api: ApiService) {}

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
    this.selectedCategory.set(category);
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
