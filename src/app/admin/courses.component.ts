import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-admin-courses',
  imports: [FormsModule],
  template: `
    <section>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;">
        <div>
          <span class="pill">Course management</span>
          <h1 class="page-title" style="font-size:clamp(1.8rem,3.2vw,2.6rem);margin-top:0.75rem;">All Courses</h1>
          <p class="page-copy" style="margin-top:0.35rem;">{{ filtered().length }} courses total</p>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
          <button class="btn-secondary" (click)="activeTab='all'">All</button>
          <button class="btn-secondary" (click)="activeTab='pending'">Pending Review</button>
          <input class="el-input" style="width:220px;" type="search" placeholder="Search courses..." [(ngModel)]="search" />
        </div>
      </div>

      @if (loading()) {
        <p class="page-copy">Loading courses...</p>
      } @else {
        <div class="grid-cards" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));">
          @for (course of filtered(); track course.courseId) {
            <article class="glass-card" style="padding:1rem;border-radius:16px;display:grid;gap:0.6rem;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
                <h3 class="section-title" style="font-size:0.98rem;margin:0;">{{ course.title }}</h3>
                <span class="pill" style="font-size:0.75rem;white-space:nowrap;">{{ course.approvalStatus || ((course.isPublished ?? course.published) ? 'APPROVED' : 'DRAFT') }}</span>
              </div>
              <p class="page-copy" style="font-size:0.82rem;">{{ truncate(course.description) }}</p>
              <div style="display:flex;gap:0.4rem;flex-wrap:wrap;font-size:0.78rem;" class="page-copy">
                <span>Category: {{ course.category }}</span>
                <span>·</span>
                <span>Level: {{ course.level }}</span>
                @if (course.price != null) {
                  <span>· {{ '₹' + course.price }}</span>
                }
              </div>
              <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                @if ((course.approvalStatus || '') === 'PENDING_APPROVAL') {
                  <button class="el-btn" style="padding:0.35rem 0.8rem;font-size:0.8rem;" (click)="approveCourse(course.courseId)">Approve</button>
                  <input class="el-input" style="max-width:180px;padding:0.35rem 0.5rem;font-size:0.8rem;" placeholder="Rejection reason" [(ngModel)]="rejectReasons[course.courseId]" />
                  <button class="btn-secondary" style="padding:0.35rem 0.8rem;font-size:0.8rem;" (click)="rejectCourse(course.courseId)">Reject</button>
                }
                <button class="btn-secondary" style="padding:0.35rem 0.8rem;font-size:0.8rem;color:#e05c5c;" (click)="deleteCourse(course)">Delete</button>
              </div>
            </article>
          }
          @if (filtered().length === 0) {
            <p class="page-copy">No courses found.</p>
          }
        </div>
      }
    </section>
  `,
})
export class AdminCoursesComponent implements OnInit {
  protected courses = signal<any[]>([]);
  protected loading = signal(true);
  protected search = '';
  protected activeTab: 'all' | 'pending' = 'all';
  protected rejectReasons: Record<number, string> = {};

  protected filtered = computed(() =>
    this.courses().filter(c =>
      (this.activeTab === 'all' || c.approvalStatus === 'PENDING_APPROVAL') &&
      (!this.search || c.title?.toLowerCase().includes(this.search.toLowerCase()))
    )
  );

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.api.getAllCoursesAdmin().subscribe({
      next: (res: any) => { this.courses.set(res.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected truncate(s: string | null | undefined): string {
    if (!s) return '';
    return s.length > 80 ? s.substring(0, 80) + '...' : s;
  }

  protected deleteCourse(course: any) {
    if (!confirm(`Delete "${course.title}"?`)) return;
    this.api.deleteCourse(course.courseId).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to delete course'),
    });
  }

  protected approveCourse(courseId: number) {
    this.api.approveCourse(courseId).subscribe({ next: () => this.load() });
  }

  protected rejectCourse(courseId: number) {
    const reason = this.rejectReasons[courseId] || 'Rejected by admin review';
    this.api.rejectCourse(courseId, reason).subscribe({ next: () => this.load() });
  }
}
