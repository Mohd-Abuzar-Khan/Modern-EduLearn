import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface CourseProgress {
  courseId: number;
  title: string;
  percentage: number;
  completedLessons: number;
}

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  template: `
    <section>
      <div style="margin-bottom: 2rem;">
        <span class="pill">My Learning</span>
        <h1 class="page-title" style="font-size: clamp(2rem, 4vw, 3rem); margin-top: 0.8rem;">Learning Progress</h1>
        <p class="page-copy" style="margin-top: 0.35rem;">Track your daily activity and course completion</p>
      </div>

      <!-- Summary Stats -->
      <div class="grid-cards" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 2rem;">
        <article class="glass-card" style="padding: 1.5rem; border-radius: 16px;">
          <div class="page-copy" style="font-size: 0.9rem; opacity: 0.8;">Courses in Progress</div>
          <strong style="font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem;">{{ coursesInProgress() }}</strong>
        </article>
        <article class="glass-card" style="padding: 1.5rem; border-radius: 16px;">
          <div class="page-copy" style="font-size: 0.9rem; opacity: 0.8;">Lessons Completed</div>
          <strong style="font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem; color: #6aaa6a;">{{ totalCompletedLessons() }}</strong>
        </article>
        <article class="glass-card" style="padding: 1.5rem; border-radius: 16px;">
          <div class="page-copy" style="font-size: 0.9rem; opacity: 0.8;">Certificates Earned</div>
          <strong style="font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem; color: #e6b065;">{{ certificatesCount() }}</strong>
        </article>
      </div>

      <div style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
        <!-- Courses List -->
        <div>
          <h2 class="section-title" style="margin-bottom: 1rem;">Course Progress</h2>
          @if (loading()) {
            <p class="page-copy">Loading progress records...</p>
          } @else if (courseProgressList().length === 0) {
            <p class="page-copy">No course progress found. Enroll in a course to see your progress here!</p>
          } @else {
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
              @for (cp of courseProgressList(); track cp.courseId) {
                <div class="glass-card" style="padding: 1.5rem; border-radius: 18px; border-left: 4px solid var(--primary);">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem; align-items: start;">
                    <h3 class="page-copy" style="margin: 0; font-weight: 600; font-size: 1.1rem; color: #fff;">{{ cp.title }}</h3>
                    <span class="pill" style="background: rgba(106, 170, 106, 0.2); color: #6aaa6a;">{{ cp.percentage }}%</span>
                  </div>
                  <div style="background: rgba(255,255,255,0.08); border-radius: 8px; height: 10px; overflow: hidden; margin-bottom: 0.8rem;">
                    <div style="background: linear-gradient(90deg, #6aaa6a, #9ecb9e); height: 100%; transition: width 0.8s ease-out;" [style.width.%]="cp.percentage"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <p class="page-copy" style="margin: 0; font-size: 0.85rem; opacity: 0.7;">
                      Lessons tracked: {{ cp.completedLessons }}
                    </p>
                    @if (cp.percentage >= 100) {
                      <span style="font-size: 1.2rem;" title="Course Completed">🏆</span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Recent Certificates (Moved to a full width row at bottom) -->
        @if (certificates().length > 0) {
          <div style="margin-top: 1rem;">
            <h2 class="section-title" style="margin-bottom: 1.25rem;">Earned Certificates</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
              @for (cert of certificates(); track cert.certificateId) {
                <div class="glass-card" style="padding: 1.25rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(230, 176, 101, 0.3);">
                  <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="font-size: 1.5rem;">📜</div>
                    <div>
                      <strong style="display: block; font-size: 0.95rem; color: #fff;">{{ cert.courseName || 'Course Certificate' }}</strong>
                      <small class="page-copy" style="font-size: 0.75rem; opacity: 0.6;">Earned: {{ cert.issuedAt | date:'mediumDate' }}</small>
                    </div>
                  </div>
                  <button class="el-btn" style="padding: 0.45rem 1rem; font-size: 0.8rem; border-radius: 8px;" (click)="downloadCert(cert)">View PDF</button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    @media (max-width: 800px) {
      div[style*="grid-template-columns: 2fr 1fr"] {
        grid-template-columns: 1fr !important;
      }
    }
  `
})
export class StudentProgressComponent implements OnInit {
  private readonly backendOrigin = (environment.backendOrigin || environment.apiBaseUrl || '').replace(/\/$/, '');

  protected loading = signal(true);

  protected coursesInProgress = signal(0);
  protected totalCompletedLessons = signal(0);
  protected certificatesCount = signal(0);
  protected certificates = signal<any[]>([]);

  protected courseProgressList = signal<CourseProgress[]>([]);

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    const uid = this.auth.userId();
    if (!uid) { this.loading.set(false); return; }

    forkJoin({
      enrollments: this.api.getEnrollmentsByStudent(uid).pipe(catchError(() => of({ data: [] }))),
      certificates: this.api.getStudentCertificates(uid).pipe(catchError(() => of({ data: [] }))),
      allRecords: this.api.getAllProgressByStudent(uid).pipe(catchError(() => of({ data: [] })))
    }).subscribe({
      next: (res: any) => {
        const enrollList = Array.isArray(res.enrollments?.data) ? res.enrollments.data : (Array.isArray(res.enrollments) ? res.enrollments : []);
        const certList = Array.isArray(res.certificates?.data) ? res.certificates.data : (Array.isArray(res.certificates) ? res.certificates : []);
        const progressRecords = Array.isArray(res.allRecords?.data) ? res.allRecords.data : (Array.isArray(res.allRecords) ? res.allRecords : []);

        // Update stats
        this.coursesInProgress.set(enrollList.filter((e: any) => e.status === 'ACTIVE').length);
        this.certificatesCount.set(certList.length);
        this.certificates.set(certList);

        // MIRROR LOGIC: If progress records are empty but enrollment says 100%, count it as completed
        let lessonCount = progressRecords.filter((r: any) => r.isCompleted === true || r.isCompleted === 1 || String(r.isCompleted) === 'true').length;
        if (lessonCount === 0 && enrollList.some((e: any) => e.progressPercent >= 100)) {
           // Fallback to enrollment-based counting if granular progress is missing
           lessonCount = enrollList.filter((e: any) => e.progressPercent >= 100).length;
        }
        this.totalCompletedLessons.set(lessonCount);

        // Process Hybrid View
        this.processHybridProgress(uid, enrollList, certList);
      },
      error: () => this.loading.set(false)
    });
  }

  private processHybridProgress(uid: number, enrollments: any[], certs: any[]) {
    if (enrollments.length === 0) {
      this.loading.set(false);
      return;
    }

    const certCourseIds = new Set(certs.map(c => c.courseId));
    const courseRequests = enrollments.map(e =>
      this.api.getCourseById(e.courseId).pipe(catchError(() => of({ data: { title: 'Course #' + e.courseId } })))
    );

    forkJoin(courseRequests).subscribe({
      next: (results: any[]) => {
        const cpList: CourseProgress[] = enrollments.map((e, index) => {
          const courseDetails = results[index]?.data || results[index];
          const pct = e.progressPercent || 0;

          // Background auto-issuance
          if (pct >= 100 && !certCourseIds.has(e.courseId)) {
            this.api.issueCertificate(uid, e.courseId).subscribe({
              next: (raw: any) => {
                const newCert = raw.data || raw;
                if (newCert && newCert.certificateId) {
                  this.certificates.update(current => {
                    if (current.some(c => c.certificateId === newCert.certificateId)) return current;
                    const updated = [...current, newCert];
                    this.certificatesCount.set(updated.length);
                    return updated;
                  });
                }
              }
            });
          }

          return {
            courseId: e.courseId,
            title: courseDetails?.title || 'Course #' + e.courseId,
            percentage: Math.round(pct),
            completedLessons: 0 // Stat only
          };
        });

        this.courseProgressList.set(cpList);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected downloadCert(cert: any) {
    if (!cert.certificateUrl) return;
    const url = cert.certificateUrl.startsWith('http') ? cert.certificateUrl : `${this.backendOrigin}${cert.certificateUrl}`;
    window.open(url, '_blank');
  }
}
