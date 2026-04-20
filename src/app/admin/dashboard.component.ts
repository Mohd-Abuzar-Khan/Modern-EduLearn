import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  template: `
    <section>
      <div class="glass-card" style="border-radius:20px;padding:1.1rem;">
        <span class="pill">Admin dashboard</span>
        <h1 class="page-title" style="font-size:clamp(1.9rem,3.4vw,2.9rem);margin-top:0.7rem;">Platform Overview</h1>
        <p class="page-copy">Monitor users, courses, payments and platform health at a glance.</p>
      </div>

      <div class="grid-cards" style="grid-template-columns:repeat(auto-fit,minmax(175px,1fr));margin-top:1rem;">
        @for (stat of stats(); track stat.label) {
          <div class="soft-card" style="padding:0.95rem;border-radius:14px;">
            <div class="page-copy" style="font-size:0.82rem;">{{ stat.label }}</div>
            <strong style="font-family:'Space Grotesk',sans-serif;font-size:1.7rem;color:var(--el-text-primary);">{{ stat.value }}</strong>
          </div>
        }
      </div>

      <div class="grid-cards" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:1rem;">
        <article class="glass-card" style="padding:1rem;border-radius:18px;">
          <h2 class="section-title" style="font-size:1.1rem;margin-bottom:0.8rem;">Quick Actions</h2>
          <div style="display:grid;gap:0.5rem;">
            <a routerLink="/admin/courses" class="btn-secondary" style="text-align:center;text-decoration:none;">Review All Courses</a>
            <a routerLink="/admin/users" class="btn-secondary" style="text-align:center;text-decoration:none;">Manage Users</a>
            <a routerLink="/admin/payments" class="btn-secondary" style="text-align:center;text-decoration:none;">View Payments</a>
          </div>
        </article>

        <article class="glass-card" style="padding:1rem;border-radius:18px;">
          <h2 class="section-title" style="font-size:1.1rem;margin-bottom:0.8rem;">Recent Courses</h2>
          @if (loading()) {
            <p class="page-copy">Loading…</p>
          } @else {
            <div style="display:grid;gap:0.5rem;">
              @for (c of recentCourses(); track c.courseId) {
                <div class="soft-card" style="padding:0.6rem;border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
                  <span style="font-size:0.85rem;color:var(--el-text-primary);">{{ c.title }}</span>
                  <span class="chip" style="font-size:0.72rem;">{{ (c.isPublished || c.published) ? 'Published' : 'Draft' }}</span>
                </div>
              }
              @if (recentCourses().length === 0) {
                <p class="page-copy" style="font-size:0.85rem;">No courses yet.</p>
              }
            </div>
          }
        </article>
      </div>
    </section>
  `,
})
export class AdminDashboardComponent implements OnInit {
  protected stats = signal([
    { label: 'Total Courses', value: '0' },
    { label: 'Published', value: '0' },
    { label: 'Total Users', value: '0' },
    { label: 'Active Platform', value: 'Live' },
  ]);
  protected recentCourses = signal<any[]>([]);
  protected loading = signal(true);

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    forkJoin({
      courses: this.api.getAllCoursesAdmin().pipe(catchError(() => of({ data: [] }))),
      users: this.api.getAllUsers().pipe(catchError(() => of({ data: [] }))),
    }).subscribe({
      next: (res: any) => {
        const courseList: any[] = Array.isArray(res.courses?.data) ? res.courses.data : (Array.isArray(res.courses) ? res.courses : []);
        const userList: any[] = Array.isArray(res.users?.data) ? res.users.data : (Array.isArray(res.users) ? res.users : []);
        
        const publishedCount = courseList.filter((c: any) => c.isPublished === true || c.published === true || c.status === 'PUBLISHED').length;

        this.recentCourses.set(courseList.slice(0, 5));
        this.stats.set([
          { label: 'Total Courses', value: String(courseList.length) },
          { label: 'Published', value: String(publishedCount) },
          { label: 'Total Users', value: String(userList.length) },
          { label: 'Active Platform', value: 'Live' },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
