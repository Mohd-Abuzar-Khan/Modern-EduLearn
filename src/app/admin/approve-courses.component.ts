import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

interface AdminCourseInfo {
  courseId: number;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  instructorId: number;
  isPublished: boolean;
}

@Component({
  selector: 'app-admin-approve-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <div>
          <span class="pill">Course Moderation</span>
          <h1 class="page-title" style="font-size: clamp(2rem, 4vw, 3rem); margin-top: 0.8rem;">Approve Courses</h1>
          <p class="page-copy" style="margin-top: 0.35rem;">Review and approve newly submitted courses.</p>
        </div>
      </div>

      @if (loading()) {
        <div style="text-align: center; padding: 2rem;">
          <p class="page-copy">Loading pending courses...</p>
        </div>
      } @else if (pendingCourses().length === 0) {
        <article class="glass-card" style="padding: 2rem; border-radius: 18px; text-align: center;">
          <h3 class="section-title" style="font-size: 1.2rem;">All Caught Up!</h3>
          <p class="page-copy" style="margin-top: 0.35rem;">There are currently no courses pending your review.</p>
        </article>
      } @else {
        <div class="grid-cards" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
          @for (course of pendingCourses(); track course.courseId) {
            <article class="glass-card course-card" style="padding: 1.5rem; border-radius: 18px; display: grid; gap: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.6rem;">
                <div>
                  <h3 class="section-title" style="font-size: 1.1rem; margin: 0; line-height: 1.3;">{{ course.title }}</h3>
                  <p class="page-copy" style="font-size: 0.8rem; margin-top: 0.35rem; opacity: 0.7;">{{ course.category }} · {{ course.level }} · Instructor ID: {{ course.instructorId || 'N/A' }}</p>
                </div>
                <span class="pill" style="font-size: 0.75rem; white-space: nowrap; background: rgba(220, 150, 50, 0.2); color: #e6b065;">Pending Review</span>
              </div>

              <div class="soft-card" style="padding: 0.8rem; border-radius: 12px;">
                <span class="page-copy" style="font-size: 0.75rem; opacity: 0.7;">Price</span>
                <strong style="display: block; font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; margin-top: 0.2rem;">{{ course.price === 0 ? 'Free' : '₹' + course.price }}</strong>
              </div>

              <p class="page-copy" style="font-size: 0.85rem; line-height: 1.5; margin: 0; opacity: 0.8;">{{ course.description.substring(0, 150) }}{{ course.description.length > 150 ? '...' : '' }}</p>

              <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem;">
                <div style="display: flex; gap: 0.6rem;">
                  <button class="el-btn" style="flex: 2; padding: 0.5rem; font-size: 0.9rem;" 
                          (click)="approveCourse(course.courseId)" 
                          [disabled]="processingId() === course.courseId">
                    {{ processingId() === course.courseId ? 'Processing...' : '✓ Approve' }}
                  </button>
                  <button class="btn-secondary" style="flex: 1; padding: 0.5rem; font-size: 0.9rem; color: #e05c5c; border-color: rgba(224,92,92,0.3);" 
                          (click)="rejectCourse(course.courseId)" 
                          [disabled]="processingId() === course.courseId">
                    ✗ Reject
                  </button>
                </div>
                
                <div style="display: flex; gap: 0.4rem; align-items: center;">
                  <input class="el-input" style="flex: 1; padding: 0.4rem 0.6rem; font-size: 0.82rem;" 
                         placeholder="Reason for rejection..." 
                         [(ngModel)]="rejectReasons[course.courseId]" />
                </div>
              </div>

              @if (errorMsg() && processingId() === course.courseId) {
                <p class="page-copy" style="font-size: 0.8rem; color: #e05c5c; margin-top: 0.3rem;">Error: {{ errorMsg() }}</p>
              }
              @if (successMsg() && processingId() === course.courseId) {
                <p class="page-copy" style="font-size: 0.8rem; color: #6aaa6a; margin-top: 0.3rem;">✓ {{ successMsg() }}</p>
              }
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .course-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .course-card:hover {
      transform: translateY(-2px);
    }
  `
})
export class AdminApproveCoursesComponent implements OnInit {
  protected pendingCourses = signal<AdminCourseInfo[]>([]);
  protected loading = signal(true);
  protected processingId = signal<number | null>(null);
  protected errorMsg = signal('');
  protected successMsg = signal('');
  protected rejectReasons: Record<number, string> = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadPendingCourses();
  }

  private loadPendingCourses() {
    this.loading.set(true);
    this.api.getPendingCourses().subscribe({
      next: (res: any) => {
        const list = res.data || [];
        this.pendingCourses.set(list.map((c: any) => ({
          courseId: c.courseId || c.id,
          title: c.title || '',
          description: c.description || '',
          category: c.category || 'General',
          level: c.level || 'Beginner',
          price: c.price || 0,
          instructorId: c.instructorId || c.instructor?.id || null,
          isPublished: false
        })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected approveCourse(id: number) {
    this.processingId.set(id);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.api.approveCourse(id).subscribe({
      next: () => {
        this.successMsg.set('Course approved successfully.');
        setTimeout(() => {
          this.pendingCourses.update(cs => cs.filter(c => c.courseId !== id));
          this.processingId.set(null);
        }, 1500);
      },
      error: () => {
        this.errorMsg.set('Failed to approve course.');
        this.processingId.set(null);
      }
    });
  }

  protected rejectCourse(id: number) {
    const reason = this.rejectReasons[id] || 'Rejected by admin review';
    this.processingId.set(id);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.api.rejectCourse(id, reason).subscribe({
      next: () => {
        this.successMsg.set('Course rejected and notice sent.');
        setTimeout(() => {
          this.pendingCourses.update(cs => cs.filter(c => c.courseId !== id));
          this.processingId.set(null);
        }, 1500);
      },
      error: () => {
        this.errorMsg.set('Failed to reject course.');
        this.processingId.set(null);
      }
    });
  }
}
