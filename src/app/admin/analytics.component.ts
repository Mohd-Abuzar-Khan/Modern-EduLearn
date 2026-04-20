import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <div style="margin-bottom: 2rem;">
        <span class="pill">Metrics</span>
        <h1 class="page-title" style="font-size: clamp(2rem, 4vw, 3rem); margin-top: 0.8rem;">Platform Analytics</h1>
        <p class="page-copy" style="margin-top: 0.35rem;">High-level overview of system metrics.</p>
      </div>

      <div class="grid-cards" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 2rem;">
        <article class="glass-card" style="padding: 1.5rem; border-radius: 16px;">
          <div class="page-copy" style="font-size: 0.9rem; opacity: 0.8;">Total Courses</div>
          <strong style="font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem;">{{ loading() ? '-' : totalCourses() }}</strong>
        </article>
        <article class="glass-card" style="padding: 1.5rem; border-radius: 16px;">
          <div class="page-copy" style="font-size: 0.9rem; opacity: 0.8;">Published Courses</div>
          <strong style="font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem; color: #6aaa6a;">{{ loading() ? '-' : publishedCourses() }}</strong>
        </article>
        <article class="glass-card" style="padding: 1.5rem; border-radius: 16px;">
          <div class="page-copy" style="font-size: 0.9rem; opacity: 0.8;">Pending Review</div>
          <strong style="font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem; color: #e6b065;">{{ loading() ? '-' : pendingReview() }}</strong>
        </article>
      </div>

      <article class="soft-card" style="padding: 2rem; border-radius: 16px; text-align: center; border: 1px dashed rgba(255,255,255,0.2);">
        <h3 class="section-title">Expanded Analytics Pending</h3>
        <p class="page-copy" style="max-width: 500px; margin: 1rem auto 0 auto;">
          Full analytics (revenue, user growth, lesson engagement) require the backend to add dedicated aggregation endpoints. Currently displaying basic computed metrics from available administrative data.
        </p>
      </article>
    </section>
  `
})
export class AdminAnalyticsComponent implements OnInit {
  protected loading = signal(true);
  protected totalCourses = signal(0);
  protected publishedCourses = signal(0);
  protected pendingReview = signal(0);

  constructor(private api: ApiService) {}

  ngOnInit() {
    // Attempt to use getAllCoursesAdmin or fallback to getAllCourses
    const fetchCall = (this.api as any).getAllCoursesAdmin 
      ? (this.api as any).getAllCoursesAdmin() 
      : this.api.getAllCourses();

    fetchCall.subscribe({
      next: (res: any) => {
        const courses: any[] = res.data || res || [];
        this.totalCourses.set(courses.length);
        
        let published = 0;
        let pending = 0;
        
        courses.forEach(c => {
          if (c.published || c.isPublished) {
            published++;
          } else {
            pending++;
          }
        });

        this.publishedCourses.set(published);
        this.pendingReview.set(pending);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
