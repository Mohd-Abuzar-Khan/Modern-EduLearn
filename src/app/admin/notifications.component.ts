import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-notifications',
  imports: [DatePipe],
  template: `
    <section>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;flex-wrap:wrap;">
        <div>
          <span class="pill">Activity feed</span>
          <h1 class="page-title" style="font-size:clamp(1.8rem,3.2vw,2.6rem);margin-top:0.75rem;">Notifications</h1>
          <p class="page-copy" style="margin-top:0.35rem;">{{ notifications().length }} total notifications</p>
        </div>
        <button class="btn-secondary" type="button" (click)="markAllRead()">Mark all read</button>
      </div>

      <div style="display:grid;gap:0.7rem;margin-top:1rem;">
        @if (loading()) {
          <p class="page-copy">Loading…</p>
        } @else if (notifications().length === 0) {
          <p class="page-copy">No notifications yet.</p>
        } @else {
          @for (n of notifications(); track n.notificationId) {
            <article class="glass-card" style="padding:1rem;border-radius:14px;opacity:{{n.read ? '0.65' : '1'}};">
              <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;">
                <div>
                  <strong style="font-family:'Space Grotesk',sans-serif;color:var(--el-text-primary);">{{ n.title ?? n.type }}</strong>
                  <p class="page-copy" style="margin-top:0.25rem;">{{ n.message }}</p>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem;">
                  <span class="page-copy" style="font-size:0.78rem;white-space:nowrap;">{{ n.createdAt | date:'short' }}</span>
                  @if (!n.read) { <span class="pill" style="font-size:0.7rem;">Unread</span> }
                </div>
              </div>
              <div style="display:flex;gap:0.4rem;margin-top:0.6rem;">
                @if (!n.read) {
                  <button class="chip" type="button" (click)="markRead(n)">Mark read</button>
                }
                <button class="chip" type="button" (click)="deleteNotif(n)">Delete</button>
              </div>
            </article>
          }
        }
      </div>
    </section>
  `,
})
export class AdminNotificationsComponent implements OnInit {
  protected notifications = signal<any[]>([]);
  protected loading = signal(true);

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  private load() {
    const uid = this.auth.userId();
    if (!uid) { this.loading.set(false); return; }
    this.api.getNotifications(uid).subscribe({
      next: (data: any[]) => { this.notifications.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected markRead(n: any) {
    this.api.markNotificationRead(n.notificationId).subscribe({ next: () => this.load() });
  }

  protected markAllRead() {
    const uid = this.auth.userId();
    if (!uid) return;
    this.api.markAllNotificationsRead(uid).subscribe({ next: () => this.load() });
  }

  protected deleteNotif(n: any) {
    this.api.deleteNotification(n.notificationId).subscribe({ next: () => this.load() });
  }
}
