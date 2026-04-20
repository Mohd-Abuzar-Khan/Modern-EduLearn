import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-instructor-students',
  imports: [FormsModule, DatePipe],
  template: `
    <section>
      <!-- Header with inline search -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap-reverse;">
        <div>
          <h1 class="page-title" style="margin-bottom: 0.5rem;">Students</h1>
          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <span class="inline-stat">{{ enrollments().length }} total</span>
            <span class="inline-stat">·</span>
            <span class="inline-stat">{{ activeCount() }} active</span>
            <span class="inline-stat">·</span>
            <span class="inline-stat">{{ atRiskCount() }} at risk</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <select class="el-input" style="width: 200px; padding: 7px 14px; font-size: 0.8rem;" [(ngModel)]="selectedCourseId" (ngModelChange)="onCourseChange($event)">
            <option [ngValue]="0">Select a course</option>
            @for (course of courses(); track course.courseId) {
              <option [ngValue]="course.courseId">{{ course.title }}</option>
            }
          </select>
          <input
            class="el-input search-compact"
            type="search"
            placeholder="Search..."
            [(ngModel)]="searchQuery"
          />
        </div>
      </div>

      @if (loading()) {
        <div style="text-align: center; padding: 2rem 1rem; margin-top: 1.2rem;">
          <p class="page-copy">Loading students...</p>
        </div>
      } @else if (selectedCourseId === 0) {
        <div style="text-align: center; padding: 2rem 1rem; margin-top: 1.2rem;">
          <p class="page-copy">Select a course above to view enrolled students.</p>
        </div>
      } @else if (filteredStudents().length > 0) {
        <div class="student-list" style="margin-top: 1.2rem;">
          @for (student of filteredStudents(); track student.enrollmentId) {
            <article class="student-row" [class.at-risk]="student.progressPercent < 20">
              <!-- Left: Avatar + Name -->
              <div class="student-left">
                <div class="student-avatar" [style.background]="student.fullName ? 'linear-gradient(135deg, #6aaa6a, #b9d9a0)' : 'linear-gradient(135deg, #a8cf92, #eff7e8)'">
                  {{ student.fullName ? student.fullName.substring(0,1).toUpperCase() : 'S' }}
                </div>
                <div class="student-info">
                  <div class="student-name">{{ student.fullName || 'Student #' + student.studentId }}</div>
                  @if (student.progressPercent < 20) {
                    <span class="at-risk-indicator">● At risk</span>
                  }
                  <div class="student-email">
                    {{ student.email || 'ID: ' + student.studentId }} · Enrolled {{ student.enrolledAt | date:'mediumDate' }}
                  </div>
                </div>
              </div>

              <!-- Center: Progress -->
              <div class="student-progress">
                <div class="progress-label">{{ student.progressPercent }}%</div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="student.progressPercent"></div>
                </div>
              </div>

              <!-- Center-right: Status -->
              <div class="student-active">
                <span class="active-pill">{{ student.status }}</span>
              </div>

              <!-- Right: Actions -->
              <div class="student-actions">
                @if (student.status !== 'COMPLETED') {
                  <button class="action-btn" type="button" title="Mark complete" (click)="markComplete(student)">✓</button>
                }
                <button class="action-btn" type="button" title="Message student">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
              </div>
            </article>
          }
        </div>
      } @else {
        <div style="text-align: center; padding: 2rem 1rem; margin-top: 1.2rem;">
          <p class="page-copy">No students enrolled in this course yet.</p>
        </div>
      }
    </section>
  `,
  styles: `
    .inline-stat {
      font-size: 0.72rem;
      opacity: 0.5;
      font-weight: 400;
      letter-spacing: 0.04em;
    }

    .search-compact {
      width: 180px !important;
      padding: 7px 14px !important;
      font-size: 0.8rem !important;
    }

    .student-list { display: grid; gap: 8px; width: 100%; }

    .student-row {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 12px 16px; border-radius: 12px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.10);
      backdrop-filter: blur(8px);
      transition: all 0.2s ease;
    }

    .student-row:hover { background: rgba(255, 255, 255, 0.09); border-color: rgba(255, 255, 255, 0.14); }
    .student-row.at-risk { border-color: rgba(200, 150, 50, 0.25); }

    .student-left { display: flex; align-items: center; gap: 0.65rem; flex: 0 0 auto; }

    .student-avatar {
      width: 36px; height: 36px; border-radius: 999px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #a8cf92, #eff7e8);
      color: #172418; font-weight: 700; font-size: 0.65rem; flex-shrink: 0;
    }

    .student-info { display: grid; gap: 0.2rem; }

    .student-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.88rem; font-weight: 600;
      line-height: 1; color: var(--el-text-primary);
    }

    .at-risk-indicator { font-size: 0.6rem; color: rgba(200, 150, 50, 0.9); }

    .student-email {
      font-size: 0.72rem; opacity: 0.5; line-height: 1;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    .student-progress {
      display: flex; flex-direction: column; gap: 0.3rem;
      flex: 0 0 100px; min-width: 0;
    }

    .progress-label { font-size: 0.78rem; font-weight: 500; opacity: 0.8; text-align: center; }

    .progress-bar {
      width: 100%; height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px; overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6aaa6a, #b9d9a0);
      border-radius: inherit; transition: width 0.25s ease;
    }

    .student-active { flex: 0 0 auto; }

    .active-pill {
      display: inline-flex; align-items: center;
      padding: 4px 10px; border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 0.72rem; opacity: 0.7; white-space: nowrap;
    }

    .student-actions { display: flex; align-items: center; gap: 0.35rem; flex: 0 0 auto; }

    .action-btn {
      width: 28px; height: 28px; border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.20);
      background: rgba(255, 255, 255, 0.04);
      color: var(--el-text-secondary); font-size: 0.85rem;
      padding: 4px; display: flex; align-items: center;
      justify-content: center; cursor: pointer; transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.10);
      border-color: rgba(255, 255, 255, 0.30);
      color: var(--el-text-primary);
    }

    @media (max-width: 820px) {
      .search-compact { width: 100% !important; }
      .student-row { flex-direction: column; align-items: flex-start; gap: 0.55rem; }
      .student-left, .student-progress, .student-active, .student-actions { width: 100%; }
    }
  `,
})
export class InstructorStudentsComponent implements OnInit {
  protected searchQuery = '';
  protected selectedCourseId = 0;
  protected readonly courses = signal<any[]>([]);
  protected readonly enrollments = signal<any[]>([]);
  protected readonly loading = signal(false);
  private studentCache: Map<number, any> = new Map();

  protected readonly filteredStudents = computed(() => {
    const query = this.searchQuery.trim().toLowerCase();
    return this.enrollments().filter(s => {
      if (!query) return true;
      const name = (s.fullName || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      return name.includes(query) || email.includes(query) || `student #${s.studentId}`.includes(query) || (s.status || '').toLowerCase().includes(query);
    });
  });

  protected readonly activeCount = computed(() => this.enrollments().filter(e => e.status === 'ACTIVE').length);
  protected readonly atRiskCount = computed(() => this.enrollments().filter(e => (e.progressPercent || 0) < 20).length);

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const uid = this.auth.userId();
    if (!uid) return;
    this.api.getCoursesByInstructor(uid).subscribe({
      next: (res: any) => {
        const courseList = res.data || [];
        this.courses.set(courseList);
        
        // Load all students for all courses by default
        if (courseList.length > 0) {
          const enrollRequests: any[] = courseList.map((c: any) => 
            this.api.getEnrollmentsByCourse(c.courseId).pipe(
              catchError(() => of({ success: true, data: [] }))
            )
          );
          this.loading.set(true);
          forkJoin(enrollRequests).subscribe({
            next: (results: any) => {
              let allEnrollments: any[] = [];
              results.forEach((res: any) => {
                const list = res.data || res || [];
                allEnrollments = [...allEnrollments, ...list];
              });
              
              // Remove duplicates (students enrolled in multiple courses of same instructor)
              const uniqueEnrollments = Array.from(new Map(allEnrollments.map((e: any) => [e.studentId, e])).values());
              this.enrollments.set(uniqueEnrollments);
              this.loading.set(false);
              
              // Fetch student names
              uniqueEnrollments.forEach((e: any) => {
                this.api.getUserById(e.studentId).pipe(
                  catchError(() => of({}))
                ).subscribe({
                  next: (userData: any) => {
                    this.updateEnrollmentWithUserData(e.studentId, userData);
                  }
                });
              });
            },
            error: () => this.loading.set(false)
          });
        }
      },
    });
  }

  onCourseChange(courseId: number) {
    if (!courseId || courseId === 0) {
      this.enrollments.set([]);
      return;
    }
    this.loading.set(true);
    this.api.getEnrollmentsByCourse(courseId).subscribe({
      next: (res: any) => {
        const list = res.data || res || [];
        this.enrollments.set(list);
        this.loading.set(false);
        
        // Fetch student names for these enrollments
        list.forEach((e: any) => {
          if (!this.studentCache.has(e.studentId)) {
            this.api.getUserById(e.studentId).subscribe({
              next: (userData: any) => {
                this.studentCache.set(e.studentId, userData);
                this.updateEnrollmentWithUserData(e.studentId, userData);
              }
            });
          } else {
            this.updateEnrollmentWithUserData(e.studentId, this.studentCache.get(e.studentId));
          }
        });
      },
      error: () => { this.loading.set(false); },
    });
  }

  private updateEnrollmentWithUserData(studentId: number, userData: any) {
    const normalizedUser = userData?.data ?? userData ?? {};
    const current = this.enrollments();
    const updated = current.map(e => 
      e.studentId === studentId
        ? { ...e, fullName: normalizedUser.fullName, email: normalizedUser.email }
        : e
    );
    this.enrollments.set(updated);
  }

  markComplete(student: any) {
    if (!student.enrollmentId) return;
    this.api.markEnrollmentComplete(student.enrollmentId).subscribe({
      next: () => {
        const updated = this.enrollments().map(e =>
          e.enrollmentId === student.enrollmentId ? { ...e, status: 'COMPLETED', progressPercent: 100 } : e
        );
        this.enrollments.set(updated);
      },
    });
  }
}
