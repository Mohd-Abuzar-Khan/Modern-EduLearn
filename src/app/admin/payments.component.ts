import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-payments',
  imports: [DatePipe],
  template: `
    <section>
      <span class="pill">Finance</span>
      <h1 class="page-title" style="font-size:clamp(1.8rem,3.2vw,2.6rem);margin-top:0.75rem;">Payments</h1>

      <article class="glass-card" style="padding:1.2rem;border-radius:16px;margin-top:1rem;">
        <h2 class="section-title" style="font-size:1.05rem;margin-bottom:0.8rem;">Payment History (Your Account)</h2>

        @if (loading()) {
          <p class="page-copy">Loading…</p>
        } @else if (payments().length === 0) {
          <p class="page-copy">No payment records found.</p>
        } @else {
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                  @for (h of ['ID','Course','Amount','Status','Date']; track h) {
                    <th style="text-align:left;padding:0.5rem 0.6rem;color:var(--el-text-muted);font-weight:500;">{{ h }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (p of payments(); track p.paymentId) {
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                    <td style="padding:0.5rem 0.6rem;color:var(--el-text-secondary);">#{{ p.paymentId }}</td>
                    <td style="padding:0.5rem 0.6rem;">Course #{{ p.courseId }}</td>
                    <td style="padding:0.5rem 0.6rem;">{{ '₹' + p.amount }}</td>
                    <td style="padding:0.5rem 0.6rem;">
                      <span class="chip" style="font-size:0.72rem;" [style.color]="p.status === 'SUCCESS' ? '#6aaa6a' : p.status === 'REFUNDED' ? '#f0b03a' : '#e05c5c'">
                        {{ p.status }}
                      </span>
                    </td>
                    <td style="padding:0.5rem 0.6rem;color:var(--el-text-secondary);">{{ p.createdAt | date:'mediumDate' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </article>
    </section>
  `,
})
export class AdminPaymentsComponent implements OnInit {
  protected payments = signal<any[]>([]);
  protected loading = signal(true);

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const uid = this.auth.userId();
    if (!uid) { this.loading.set(false); return; }
    this.api.getPaymentHistory(uid).subscribe({
      next: (data: any[]) => { this.payments.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
