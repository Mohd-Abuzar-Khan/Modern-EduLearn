import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-student-payments',
  imports: [FormsModule, DatePipe],
  template: `
    <section>
      <span class="pill">Billing</span>
      <h1 class="page-title" style="font-size:clamp(1.8rem,3.2vw,2.6rem);margin-top:0.75rem;">Payments</h1>

      <!-- Subscription card -->
      <article class="glass-card" style="padding:1.2rem;border-radius:18px;margin-top:1rem;">
        <h2 class="section-title" style="font-size:1.1rem;margin-bottom:0.7rem;">Subscription</h2>
        @if (loadingSubscription()) {
          <p class="page-copy">Loading subscription…</p>
        } @else if (subscription()) {
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
            <div>
              <strong style="font-family:'Space Grotesk',sans-serif;font-size:1.1rem;color:var(--el-text-primary);">
                {{ subscription().plan }} Plan
              </strong>
              <p class="page-copy" style="margin-top:0.25rem;font-size:0.82rem;">
                Status: {{ subscription().status }} · Expires: {{ subscription().endDate | date:'mediumDate' }}
              </p>
            </div>
            <button class="btn-secondary" type="button" (click)="cancelSubscription()" [disabled]="cancelling()">
              {{ cancelling() ? 'Cancelling…' : 'Cancel Plan' }}
            </button>
          </div>
        } @else {
          <p class="page-copy" style="margin-bottom:0.8rem;">No active subscription. Choose a plan to get full access.</p>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            @for (plan of plans; track plan.key) {
              <button class="btn-secondary" type="button" (click)="subscribe(plan.key)" [disabled]="subscribing()">
                {{ plan.label }}
              </button>
            }
          </div>
          @if (subMsg()) { <p class="page-copy" style="margin-top:0.5rem;font-size:0.82rem;color:#6aaa6a;">{{ subMsg() }}</p> }
        }
      </article>

      <!-- Enroll in a course by paying -->
      <article class="glass-card" style="padding:1.2rem;border-radius:18px;margin-top:1rem;">
        <h2 class="section-title" style="font-size:1.1rem;margin-bottom:0.7rem;">Purchase a Course</h2>
        <div style="display:flex;gap:0.6rem;flex-wrap:wrap;align-items:flex-end;">
          <label style="display:grid;gap:0.35rem;">
            <span class="page-copy" style="font-size:0.82rem;">Course ID</span>
            <input class="el-input" type="number" [(ngModel)]="buyCourseId" style="width:100px;" placeholder="ID" />
          </label>
          <label style="display:grid;gap:0.35rem;">
            <span class="page-copy" style="font-size:0.82rem;">Amount (₹)</span>
            <input class="el-input" type="number" [(ngModel)]="buyAmount" style="width:100px;" placeholder="799" />
          </label>
          <button class="el-btn" type="button" style="width:auto;padding-inline:1rem;" (click)="createOrder()" [disabled]="ordering()">
            {{ ordering() ? 'Creating order…' : 'Proceed to Pay' }}
          </button>
        </div>
        @if (orderMsg()) { <p class="page-copy" style="margin-top:0.5rem;font-size:0.82rem;" [style.color]="orderError() ? '#e05c5c' : '#6aaa6a'">{{ orderMsg() }}</p> }
        @if (pendingOrder()) {
          <div class="soft-card" style="margin-top:0.8rem;padding:0.8rem;border-radius:12px;">
            <p class="page-copy" style="font-size:0.85rem;">Order created. Order ID: <strong>{{ pendingOrder().orderId }}</strong></p>
            <p class="page-copy" style="font-size:0.8rem;margin-top:0.25rem;">In production, the Razorpay SDK opens here to complete payment. Then call verify endpoint.</p>
            <button class="btn-secondary" type="button" style="margin-top:0.5rem;" (click)="simulateVerify()">Simulate Payment (Dev)</button>
          </div>
        }
      </article>

      <!-- Payment history -->
      <article class="glass-card" style="padding:1.2rem;border-radius:18px;margin-top:1rem;">
        <h2 class="section-title" style="font-size:1.1rem;margin-bottom:0.7rem;">Payment History</h2>
        @if (loadingHistory()) {
          <p class="page-copy">Loading…</p>
        } @else if (payments().length === 0) {
          <p class="page-copy">No payment records yet.</p>
        } @else {
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                  @for (h of ['#','Course','Amount','Status','Date']; track h) {
                    <th style="text-align:left;padding:0.45rem 0.5rem;color:var(--el-text-muted);font-weight:500;">{{ h }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (p of payments(); track p.paymentId) {
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:0.45rem 0.5rem;color:var(--el-text-secondary);">#{{ p.paymentId }}</td>
                    <td style="padding:0.45rem 0.5rem;">Course #{{ p.courseId }}</td>
                    <td style="padding:0.45rem 0.5rem;">{{ '₹' + p.amount }}</td>
                    <td style="padding:0.45rem 0.5rem;">
                      <span class="chip" style="font-size:0.72rem;"
                        [style.color]="p.status==='SUCCESS'?'#6aaa6a':p.status==='REFUNDED'?'#f0b03a':'#e05c5c'">
                        {{ p.status }}
                      </span>
                    </td>
                    <td style="padding:0.45rem 0.5rem;color:var(--el-text-secondary);">{{ p.createdAt | date:'shortDate' }}</td>
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
export class StudentPaymentsComponent implements OnInit {
  protected payments = signal<any[]>([]);
  protected subscription = signal<any | null>(null);
  protected loadingHistory = signal(true);
  protected loadingSubscription = signal(true);
  protected cancelling = signal(false);
  protected subscribing = signal(false);
  protected ordering = signal(false);
  protected subMsg = signal('');
  protected orderMsg = signal('');
  protected orderError = signal(false);
  protected pendingOrder = signal<any | null>(null);

  protected buyCourseId = 1;
  protected buyAmount = 79;

  protected plans = [
    { key: 'FREE', label: 'Free Plan' },
    { key: 'MONTHLY', label: 'Monthly ₹799' },
    { key: 'ANNUAL', label: 'Annual ₹6,999' },
  ];

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const uid = this.auth.userId();
    if (!uid) { this.loadingHistory.set(false); this.loadingSubscription.set(false); return; }

    this.api.getPaymentHistory(uid).subscribe({
      next: (data: any[]) => { this.payments.set(data ?? []); this.loadingHistory.set(false); },
      error: () => this.loadingHistory.set(false),
    });

    this.api.getSubscriptionDetails(uid).subscribe({
      next: (sub: any) => { this.subscription.set(sub); this.loadingSubscription.set(false); },
      error: () => { this.subscription.set(null); this.loadingSubscription.set(false); },
    });
  }

  protected subscribe(plan: string) {
    const uid = this.auth.userId();
    if (!uid) return;
    this.subscribing.set(true); this.subMsg.set('');
    this.api.subscribe(uid, plan).subscribe({
      next: (sub: any) => { this.subscription.set(sub); this.subscribing.set(false); this.subMsg.set('Subscribed successfully!'); },
      error: () => { this.subscribing.set(false); this.subMsg.set('Subscription failed. Please try again.'); },
    });
  }

  protected cancelSubscription() {
    const uid = this.auth.userId();
    if (!uid || !confirm('Cancel your subscription?')) return;
    this.cancelling.set(true);
    this.api.cancelSubscription(uid).subscribe({
      next: () => { this.subscription.set(null); this.cancelling.set(false); },
      error: () => this.cancelling.set(false),
    });
  }

  protected createOrder() {
    const uid = this.auth.userId();
    if (!uid || !this.buyCourseId || !this.buyAmount) return;
    this.ordering.set(true); this.orderMsg.set(''); this.orderError.set(false); this.pendingOrder.set(null);
    this.api.createPaymentOrder(uid, this.buyCourseId, this.buyAmount).subscribe({
      next: (res: any) => {
        this.ordering.set(false);
        // Handle wrapped/unwrapped
        const order = res?.data ?? res;
        this.pendingOrder.set(order);
        this.orderMsg.set('Order created! Complete payment below.');
      },
      error: () => { this.ordering.set(false); this.orderError.set(true); this.orderMsg.set('Failed to create order.'); },
    });
  }

  protected simulateVerify() {
    const uid = this.auth.userId();
    const order = this.pendingOrder();
    if (!uid || !order) return;
    // In production Razorpay callback provides razorpayPaymentId + signature
    this.api.verifyPayment({
      razorpayOrderId: order.orderId,
      razorpayPaymentId: 'pay_simulated_' + Date.now(),
      razorpaySignature: 'simulated_sig',
      studentId: String(uid),
      courseId: String(this.buyCourseId),
    }).subscribe({
      next: () => { this.pendingOrder.set(null); this.orderMsg.set('Payment verified! Course enrolled.'); this.ngOnInit(); },
      error: () => this.orderMsg.set('Verification failed (expected in dev without real Razorpay keys).'),
    });
  }
}
