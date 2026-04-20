import { Component, OnInit, signal, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-student-certificates',
  imports: [DatePipe, FormsModule],
  template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
        <div>
          <span class="pill">Achievements</span>
          <h1 class="page-title" style="font-size:clamp(1.8rem,3.2vw,2.6rem);margin-top:0.75rem;">Certificates</h1>
          <p class="page-copy" style="margin-top:0.35rem;">{{ certificates().length }} certificate(s) earned</p>
        </div>
        <button (click)="refreshAchievements()" class="el-btn" style="padding: 0.6rem 1.2rem; display: flex; align-items: center; gap: 0.5rem; background: rgba(106, 170, 106, 0.15); border: 1px solid var(--primary); color: #fff; cursor: pointer; border-radius: 12px; width: auto;">
          Refresh My Achievements
        </button>
      </div>

      @if (loading()) {
        <p class="page-copy" style="margin-top: 1.5rem;">Loading certificates...</p>
      } @else {
        <div class="grid-cards" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:1rem;">
          @for (item of certificates(); track $index) {
            <article class="glass-card" style="padding:1rem;border-radius:18px;display:grid;gap:0.85rem;">
              <div class="certificate-art" style="border-top-color:#6aaa6a;">
                <div class="certificate-art-frame">
                  <div class="certificate-art-header">
                    <span class="certificate-art-badge">EduLearn</span>
                    <span class="certificate-art-year">{{ item.issuedAt | date:'yyyy' }}</span>
                  </div>
                  <div class="certificate-art-body">
                    <div class="certificate-art-title">Certificate</div>
                    <div class="certificate-art-subtitle">of Completion</div>
                    <div class="certificate-art-line certificate-art-line--wide"></div>
                    <div class="certificate-art-line"></div>
                  </div>
                  <div class="certificate-art-footer">
                    <div class="certificate-art-seal">✓</div>
                  </div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                <div>
                  <div class="page-copy" style="font-size:0.85rem;">Issued {{ item.issuedAt | date:'mediumDate' }}</div>
                  <div class="page-copy" style="font-size:0.75rem; color: var(--el-accent); font-weight: 500;">{{ item.studentName || 'Student Achiever' }}</div>
                </div>
              </div>
              <h3 class="section-title" style="font-size:1.05rem;">{{ item.courseName || ('Course #' + item.courseId) }}</h3>
              <p class="page-copy" style="font-size:0.75rem;opacity:0.6;">Code: {{ item.verificationCode }}</p>
              <div style="display:flex;gap:0.5rem;">
                <button class="el-btn" type="button" style="padding:0.4rem 0.8rem;font-size:0.8rem;flex:1;" (click)="downloadCert(item)">Download PDF</button>
                <button class="btn-secondary" type="button" style="padding:0.4rem 0.8rem;font-size:0.8rem;" (click)="copyCode(item.verificationCode)">Copy Code</button>
              </div>
            </article>
          }
          @if (certificates().length === 0) {
            <article class="glass-card" style="padding:1rem;border-radius:18px;grid-column:1/-1;">
              <p class="page-copy">No certificates yet. Complete a course to earn your first!</p>
            </article>
          }
        </div>
      }
    </section>
  `,
})
export class StudentCertificatesComponent implements OnInit {
  private readonly backendOrigin = (environment.backendOrigin || environment.apiBaseUrl || '').replace(/\/$/, '');

  protected certificates = signal<any[]>([]);
  protected loading = signal(true);

  constructor(private api: ApiService, private auth: AuthService) {
    // REACTIVE SYNC: Automatically reload when user ID is finalized (e.g. 44 -> 45)
    effect(() => {
      const uid = this.auth.userId();
      if (uid) {
        console.log('REACTIVE LOAD: User ID detected as ' + uid + '. Fetching certificates...');
        this.loadCertificates(uid);
      }
    });
  }

  ngOnInit() {
    this.auth.refreshCurrentUser(); // Trigger the ID sync
  }

  protected refreshAchievements() {
    this.auth.refreshCurrentUser(); // Sync ID first
    // Loading state is handled by the effect calling loadCertificates
    console.log('MANUAL REFRESH: Re-syncing certificates...');
  }

  private loadCertificates(uid: number) {
    this.loading.set(true);
    console.log('DIAGNOSTIC: Requesting certificates for User ID:', uid);

    // 1. Load actual certificates
    this.api.getStudentCertificates(uid).subscribe(
      (res: any) => {
        console.log('Certificates Debug - UID:', uid);
        console.log('Certificates Debug - Raw Response:', res);
        const certList = res.data || res || [];
        console.log('Certificates Debug - Parsed List:', certList);
        this.certificates.set(certList);
        this.loading.set(false); // STOP LOADING IMMEDIATELY when initial data arrives

        // 2. Background Check: Enrollments for 100% courses and auto-issue missing ones
        this.api.getEnrollmentsByStudent(uid).subscribe(
          (eRes: any) => {
            const enrollList: any[] = Array.isArray(eRes?.data) ? eRes.data : (Array.isArray(eRes) ? eRes : []);
            const certCourseIds = new Set(certList.map((c: any) => c.courseId));

            enrollList.forEach(e => {
              if (e.progressPercent >= 100 && !certCourseIds.has(e.courseId)) {
                this.api.issueCertificate(uid, e.courseId).subscribe(
                  (newCert) => {
                    const certData = newCert.data || newCert;
                    if (certData && certData.certificateId) {
                      this.certificates.update(current => [...current, certData]);
                    }
                  },
                  (err) => console.error('Failed to issue certificate for course:', e.courseId, err)
                );
              }
            });
          },
          (err) => console.error('Enrollment background sync failed:', err)
        );
      },
      (err) => {
        console.error('Initial certificate load failed:', err);
        this.loading.set(false);
      }
    );

  }

  protected downloadCert(cert: any) {
    if (!cert.certificateUrl) return;

    const downloadUrl = cert.certificateUrl.startsWith('http')
      ? cert.certificateUrl
      : `${this.backendOrigin}${cert.certificateUrl}`;
    window.open(downloadUrl, '_blank');

  }

  protected copyCode(code: string) { navigator.clipboard.writeText(code).catch(() => {}); }
}
