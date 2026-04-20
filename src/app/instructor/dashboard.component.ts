import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-instructor-dashboard',
  imports: [RouterLink],
  template: `
    <section>
      <article class="glass-card welcome-banner" style="border-radius: 24px;">
        <span class="pill">Instructor dashboard</span>
        <h1 class="page-title" style="margin-top: 0.55rem;">Welcome back, {{ userName() }}</h1>
        <p class="page-copy" style="margin-top: 0.5rem;">Manage your courses, track students, and review your metrics.</p>
      </article>

      <!-- Stats -->
      <div class="grid-cards stat-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-top: 1rem;">
        @for (stat of stats(); track stat.label) {
          <article class="soft-card stat-card">
            <div class="page-copy stat-label">{{ stat.label }}</div>
            <strong class="stat-value">{{ stat.value }}</strong>
          </article>
        }
      </div>

      <!-- Recent Courses -->
      <section style="margin-top: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
          <h2 class="section-title">Your courses</h2>
          <a routerLink="/instructor/my-courses" class="view-all-link">View all</a>
        </div>

        @if (loading()) {
          <div style="margin-top: 0.85rem; text-align: center; padding: 1.5rem;">
            <p class="page-copy">Loading your courses...</p>
          </div>
        } @else {
          <div class="grid-cards" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-top: 0.85rem;">
            @for (course of courses(); track course.courseId) {
              <article class="glass-card compact-card" style="border-radius: 18px;">
                <div style="display: flex; justify-content: space-between; gap: 0.75rem; align-items: center;">
                  <span class="pill">{{ course.isPublished ? 'Published' : 'Draft' }}</span>
                  <span class="page-copy" style="font-size: 0.82rem;">{{ course.enrollmentCount || 0 }} students</span>
                </div>
                <h3 class="section-title card-title" style="margin-top: 0.8rem;">{{ course.title }}</h3>
                <p class="page-copy" style="margin-top: 0.35rem;">{{ course.category }} · {{ course.level }}</p>
                <div class="course-stats-row" style="margin-top: 0.7rem; display: flex; gap: 1rem; font-size: 0.8rem;">
                  <span class="page-copy">{{ course.totalDuration }} min</span>
                  <span class="page-copy">₹{{ course.price }}</span>
                </div>
              </article>
            }

            @if (courses().length === 0) {
              <article class="glass-card" style="padding: 1rem; border-radius: 18px;">
                <h3 class="section-title" style="font-size: 1.1rem;">No courses yet</h3>
                <p class="page-copy" style="margin-top: 0.35rem;">Create your first course to start teaching.</p>
                <a routerLink="/instructor/create-course" class="el-btn" style="margin-top: 0.8rem; display: inline-block; text-decoration: none;">Create course</a>
              </article>
            }
          </div>
        }
      </section>

      <section style="margin-top: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
          <h2 class="section-title">Quick actions</h2>
        </div>
        <div class="grid-cards" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-top: 0.85rem;">
          <a routerLink="/instructor/create-course" class="soft-card" style="padding: 1rem; border-radius: 16px; text-decoration: none; color: inherit; display: grid; gap: 0.3rem;">
            <strong>Create a Course</strong>
            <span class="page-copy" style="font-size: 0.8rem;">Start building new content</span>
          </a>
          <a routerLink="/instructor/students" class="soft-card" style="padding: 1rem; border-radius: 16px; text-decoration: none; color: inherit; display: grid; gap: 0.3rem;">
            <strong>Manage Students</strong>
            <span class="page-copy" style="font-size: 0.8rem;">View enrollment & progress</span>
          </a>
        </div>
      </section>
    </section>
  `,
})
export class InstructorDashboardComponent implements OnInit {
  protected readonly loading = signal(true);
  protected readonly userName = signal('Instructor');

  protected readonly stats = signal([
    { label: 'Total Courses', value: '—' },
    { label: 'Published', value: '—' },
    { label: 'Total Students', value: '—' },
    { label: 'Avg Duration', value: '—' },
  ]);

  protected readonly courses = signal<any[]>([]);

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.userName.set(user.fullName?.split(' ')[0] || 'Instructor');
    }

    const uid = this.auth.userId();
    if (!uid) { this.loading.set(false); return; }

    this.api.getCoursesByInstructor(uid).subscribe({
      next: (res: any) => {
        const courseList: any[] = Array.isArray((res as any)?.data) 
          ? (res as any).data 
          : (Array.isArray(res) ? res : []);
        const publishedCount = courseList.filter((c: any) => c.isPublished).length;
        const avgDuration = courseList.length > 0
          ? Math.round(courseList.reduce((sum: number, c: any) => sum + (c.totalDuration || 0), 0) / courseList.length)
          : 0;

        // Get enrollment counts for each course
        if (courseList.length > 0) {
          const enrollmentRequests = courseList.map((c: any) => 
            this.api.getEnrollmentsByCourse(c.courseId).pipe(
              catchError(() => of({ success: true, data: [] }))
            )
          );
          forkJoin(enrollmentRequests).subscribe({
            next: (enrollResults: any) => {
              let totalStudents = 0;
              const enrichedCourses = courseList.map((course: any, index: number) => {
                const enrollmentData = Array.isArray(enrollResults[index]?.data) 
                  ? enrollResults[index].data 
                  : (Array.isArray(enrollResults[index]) ? enrollResults[index] : []);
                const enrollCount = enrollmentData.length;
                totalStudents += enrollCount;
                return { ...course, enrollmentCount: enrollCount };
              });

              this.courses.set(enrichedCourses);
              this.stats.set([
                { label: 'Total Courses', value: String(courseList.length) },
                { label: 'Published', value: String(publishedCount) },
                { label: 'Total Students', value: String(totalStudents) },
                { label: 'Avg Duration', value: `${avgDuration} min` },
              ]);
              this.loading.set(false);
            },
            error: () => {
              this.courses.set(courseList);
              this.stats.set([
                { label: 'Total Courses', value: String(courseList.length) },
                { label: 'Published', value: String(publishedCount) },
                { label: 'Total Students', value: '—' },
                { label: 'Avg Duration', value: `${avgDuration} min` },
              ]);
              this.loading.set(false);
            },
          });
        } else {
          this.courses.set([]);
          this.stats.set([
            { label: 'Total Courses', value: '0' },
            { label: 'Published', value: '0' },
            { label: 'Total Students', value: '0' },
            { label: 'Avg Duration', value: '0 min' },
          ]);
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
