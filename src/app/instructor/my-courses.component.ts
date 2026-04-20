import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

interface CourseCard {
  courseId: number;
  title: string;
  category: string;
  level: string;
  price: number;
  totalDuration: number;
  description: string;
  isPublished: boolean;
  enrollmentCount: number;
  createdAt?: string;
}

@Component({
  selector: 'app-instructor-my-courses',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.9rem; flex-wrap: wrap; margin-bottom: 1rem;">
        <div>
          <span class="pill">Course management</span>
          <h1 class="page-title" style="font-size: clamp(1.8rem, 3.2vw, 2.6rem); margin-top: 0.75rem;">My Courses</h1>
          <p class="page-copy" style="margin-top: 0.35rem;">{{ loadingCourses() ? 'Loading...' : 'Manage ' + courses().length + ' courses' }}</p>
        </div>
        <a class="el-btn" style="width: auto; min-width: 170px; padding-inline: 1rem;" routerLink="/instructor/create-course">+ Create Course</a>
      </div>

      @if (loadingCourses()) {
        <div style="text-align: center; padding: 2rem;">
          <p class="page-copy">Loading your courses...</p>
        </div>
      } @else if (courses().length === 0) {
        <article class="glass-card" style="padding: 2rem; border-radius: 18px; text-align: center;">
          <h3 class="section-title" style="font-size: 1.2rem;">No courses yet</h3>
          <p class="page-copy" style="margin-top: 0.35rem;">Create your first course to start teaching learners around the world.</p>
          <a routerLink="/instructor/create-course" class="el-btn" style="margin-top: 1rem; display: inline-block; text-decoration: none;">Create your first course</a>
        </article>
      } @else {
        <!-- Filter buttons -->
        <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1rem;">
          <button class="btn-secondary" [class.el-btn]="filterStatus() === 'all'" (click)="filterStatus.set('all')" style="cursor: pointer;">
            All ({{ courses().length }})
          </button>
          <button class="btn-secondary" [class.el-btn]="filterStatus() === 'published'" (click)="filterStatus.set('published')" style="cursor: pointer;">
            Published ({{ courses().filter(c => c.isPublished).length }})
          </button>
          <button class="btn-secondary" [class.el-btn]="filterStatus() === 'draft'" (click)="filterStatus.set('draft')" style="cursor: pointer;">
            Draft ({{ courses().filter(c => !c.isPublished).length }})
          </button>
        </div>

        <!-- Courses Grid -->
        <div class="grid-cards" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
          @for (course of filteredCourses(); track course.courseId) {
            <article class="glass-card course-card" style="padding: 1.2rem; border-radius: 18px; display: grid; gap: 0.8rem;">
              <!-- Header -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.6rem;">
                <div>
                  <h3 class="section-title" style="font-size: 1.05rem; margin: 0; line-height: 1.3;">{{ course.title }}</h3>
                  <p class="page-copy" style="font-size: 0.8rem; margin-top: 0.35rem; opacity: 0.7;">{{ course.category }} · {{ course.level }}</p>
                </div>
                <span class="pill" style="font-size: 0.75rem; white-space: nowrap;">{{ course.isPublished ? '✓ Published' : 'Draft' }}</span>
              </div>

              <!-- Stats Grid -->
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem;">
                <div class="soft-card" style="padding: 0.7rem; border-radius: 12px;">
                  <span class="page-copy" style="font-size: 0.75rem; opacity: 0.7;">Students</span>
                  <strong style="display: block; font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; margin-top: 0.2rem;">{{ course.enrollmentCount || 0 }}</strong>
                </div>
                <div class="soft-card" style="padding: 0.7rem; border-radius: 12px;">
                  <span class="page-copy" style="font-size: 0.75rem; opacity: 0.7;">Duration</span>
                  <strong style="display: block; font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; margin-top: 0.2rem;">{{ course.totalDuration }}m</strong>
                </div>
                <div class="soft-card" style="padding: 0.7rem; border-radius: 12px;">
                  <span class="page-copy" style="font-size: 0.75rem; opacity: 0.7;">Price</span>
                  <strong style="display: block; font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; margin-top: 0.2rem;">₹{{ course.price }}</strong>
                </div>
                <div class="soft-card" style="padding: 0.7rem; border-radius: 12px;">
                  <span class="page-copy" style="font-size: 0.75rem; opacity: 0.7;">Level</span>
                  <strong style="display: block; font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem; margin-top: 0.2rem;">{{ course.level }}</strong>
                </div>
              </div>

              <!-- Description -->
              <p class="page-copy" style="font-size: 0.82rem; line-height: 1.4; margin: 0; opacity: 0.8;">{{ course.description.substring(0, 100) }}{{ course.description.length > 100 ? '...' : '' }}</p>

              <!-- Action Buttons -->
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                <a class="btn-secondary" [routerLink]="['/instructor/create-course']" [queryParams]="{ courseId: course.courseId }" style="font-size: 0.85rem; padding: 0.5rem 0.75rem;">
                  Edit
                </a>
                @if (course.isPublished) {
                  <button class="btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 0.75rem; cursor: pointer;" (click)="unpublishCourse(course.courseId)">
                    {{ unpublishingId() === course.courseId ? 'Unpublishing...' : 'Unpublish' }}
                  </button>
                } @else {
                  <button class="btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 0.75rem; cursor: pointer; color: #6aaa6a;" (click)="publishCourse(course.courseId)">
                    {{ publishingId() === course.courseId ? 'Publishing...' : 'Publish' }}
                  </button>
                }
                <button class="chip" style="font-size: 0.82rem; color: #e05c5c; cursor: pointer;" (click)="deleteCourse(course.courseId)">
                  {{ deletingId() === course.courseId ? 'Deleting...' : 'Delete' }}
                </button>
              </div>

              @if (errorMsg()?.courseId === course.courseId) {
                <p class="page-copy" style="font-size: 0.78rem; color: #e05c5c; margin-top: 0.3rem;">Error: {{ errorMsg()!.message }}</p>
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

    @media (max-width: 680px) {
      .grid-cards {
        grid-template-columns: 1fr !important;
      }
    }
  `,
})
export class InstructorMyCoursesComponent implements OnInit {
  protected courses = signal<CourseCard[]>([]);
  protected loadingCourses = signal(true);
  protected filterStatus = signal<'all' | 'published' | 'draft'>('all');
  protected publishingId = signal<number | null>(null);
  protected unpublishingId = signal<number | null>(null);
  protected deletingId = signal<number | null>(null);
  protected errorMsg = signal<{ courseId: number; message: string } | null>(null);

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    this.loadCourses();
  }

  protected get filteredCourses() {
    return () => {
      const status = this.filterStatus();
      const allCourses = this.courses();
      
      if (status === 'published') return allCourses.filter(c => c.isPublished);
      if (status === 'draft') return allCourses.filter(c => !c.isPublished);
      return allCourses;
    };
  }

  private loadCourses() {
    const uid = this.auth.userId();
    if (!uid) { this.loadingCourses.set(false); return; }

    this.api.getCoursesByInstructor(uid).subscribe({
      next: (res: any) => {
        const courseList: CourseCard[] = (res.data || []).map((c: any) => ({
          courseId: c.courseId || c.id,
          title: c.title || '',
          category: c.category || 'General',
          level: c.level || 'Beginner',
          price: c.price || 0,
          totalDuration: c.totalDuration || 0,
          description: c.description || '',
          isPublished: c.published || c.isPublished || false,
          enrollmentCount: 0,
          createdAt: c.createdAt,
        }));

        // Load enrollment counts
        if (courseList.length > 0) {
          courseList.forEach((course, idx) => {
            this.api.getEnrollmentsByCourse(course.courseId).subscribe({
              next: (enrollRes: any) => {
                const enrollments = enrollRes.data || enrollRes || [];
                courseList[idx].enrollmentCount = Array.isArray(enrollments) ? enrollments.length : 0;
              }
            });
          });
        }

        this.courses.set(courseList);
        this.loadingCourses.set(false);
      },
      error: () => {
        this.loadingCourses.set(false);
      }
    });
  }

  protected publishCourse(courseId: number) {
    this.publishingId.set(courseId);
    this.errorMsg.set(null);

    this.api.publishCourse(courseId).subscribe({
      next: () => {
        this.publishingId.set(null);
        this.courses.update(cs => 
          cs.map(c => c.courseId === courseId ? { ...c, isPublished: true } : c)
        );
      },
      error: (err) => {
        this.publishingId.set(null);
        this.errorMsg.set({
          courseId,
          message: err?.error?.message || 'Failed to publish course'
        });
      }
    });
  }

  protected unpublishCourse(courseId: number) {
    this.unpublishingId.set(courseId);
    this.errorMsg.set(null);

    // Note: Backend might not have unpublish endpoint, so we update directly
    this.api.updateCourse(courseId, { published: false }).subscribe({
      next: () => {
        this.unpublishingId.set(null);
        this.courses.update(cs =>
          cs.map(c => c.courseId === courseId ? { ...c, isPublished: false } : c)
        );
      },
      error: (err) => {
        this.unpublishingId.set(null);
        this.errorMsg.set({
          courseId,
          message: err?.error?.message || 'Failed to unpublish course'
        });
      }
    });
  }

  protected deleteCourse(courseId: number) {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

    this.deletingId.set(courseId);
    this.errorMsg.set(null);

    this.api.deleteCourse(courseId).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.courses.update(cs => cs.filter(c => c.courseId !== courseId));
      },
      error: (err) => {
        this.deletingId.set(null);
        this.errorMsg.set({
          courseId,
          message: err?.error?.message || 'Failed to delete course'
        });
      }
    });
  }
}
