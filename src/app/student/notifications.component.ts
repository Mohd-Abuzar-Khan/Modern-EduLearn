import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-student-notifications',
  imports: [DatePipe],
  template: `
    <section>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;flex-wrap:wrap;">
        <div>
          <span class="pill">Updates</span>
          <h1 class="page-title" style="font-size:clamp(1.8rem,3.2vw,2.6rem);margin-top:0.75rem;">Notifications</h1>
          <p class="page-copy" style="margin-top:0.35rem;">{{ unread() }} unread</p>
        </div>
        <button class="btn-secondary" type="button" (click)="markAllRead()">Mark all read</button>
      </div>

      <div style="display:grid;gap:0.7rem;margin-top:1rem;">
        @if (loading()) {
          <p class="page-copy">Loading notifications...</p>
        } @else if (notifications().length === 0) {
          <p class="page-copy">You're all caught up!</p>
        } @else {
          @for (item of notifications(); track item.notificationId) {
            <article class="glass-card" style="padding:1rem;border-radius:14px;" [style.opacity]="item.read ? '0.65' : '1'">
              <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;">
                <div>
                  <h3 class="section-title" style="font-size:1rem;">{{ item.title ?? item.type }}</h3>
                  <p class="page-copy" style="margin-top:0.3rem;">{{ item.message }}</p>
                  <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.6rem;">
                    @if (!item.read) { <button class="chip" type="button" (click)="markRead(item)">Mark read</button> }
                    <button class="chip" type="button" (click)="deleteNotif(item)">Delete</button>
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.35rem;flex-shrink:0;">
                  <span class="page-copy" style="font-size:0.8rem;white-space:nowrap;">{{ item.createdAt | date:'shortDate' }}</span>
                  @if (!item.read) { <span class="pill" style="font-size:0.7rem;">New</span> }
                </div>
              </div>
            </article>
          }
        }
      </div>
    </section>
  `,
})
export class StudentNotificationsComponent implements OnInit {
  protected notifications = signal<any[]>([]);
  protected loading = signal(true);
  protected unread = signal(0);

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  private load() {
    const uid = this.auth.userId();
    if (!uid) { this.loading.set(false); return; }
    this.api.getNotifications(uid).subscribe({
      next: (data: any[]) => {
        this.notifications.set(data ?? []);
        this.unread.set((data ?? []).filter((n: any) => !n.read).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected markRead(item: any) {
    this.api.markNotificationRead(item.notificationId).subscribe({ next: () => this.load() });
  }

  protected markAllRead() {
    const uid = this.auth.userId();
    if (!uid) return;
    this.api.markAllNotificationsRead(uid).subscribe({ next: () => this.load() });
  }

  protected deleteNotif(item: any) {
    this.api.deleteNotification(item.notificationId).subscribe({ next: () => this.load() });
  }
}
