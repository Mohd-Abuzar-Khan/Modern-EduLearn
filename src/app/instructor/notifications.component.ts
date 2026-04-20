import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-instructor-notifications',
  imports: [DatePipe],
  template: `
    <section>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;flex-wrap:wrap;">
        <div>
          <span class="pill">Activity feed</span>
          <h1 class="page-title" style="font-size:clamp(1.8rem,3.2vw,2.6rem);margin-top:0.75rem;">Notifications</h1>
          <p class="page-copy" style="margin-top:0.35rem;">{{ unread() }} unread</p>
        </div>
        <button class="btn-secondary" type="button" (click)="markAllRead()">Mark all read</button>
      </div>

      <div style="display:grid;gap:0.7rem;margin-top:1rem;">
        @if (loading()) {
          <p class="page-copy">Loading...</p>
        } @else if (notifications().length === 0) {
          <p class="page-copy">No notifications yet.</p>
        } @else {
          @for (item of notifications(); track item.notificationId) {
            <article class="soft-card" style="padding:0.9rem;border-radius:14px;" [style.opacity]="item.read ? '0.6' : '1'">
              <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;">
                <div>
                  <strong style="font-family:'Space Grotesk',sans-serif;color:var(--el-text-primary);">{{ item.title ?? item.type }}</strong>
                  <p class="page-copy">{{ item.message }}</p>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.3rem;flex-shrink:0;">
                  <span class="page-copy" style="font-size:0.78rem;">{{ item.createdAt | date:'shortDate' }}</span>
                  @if (!item.read) { <span class="pill" style="font-size:0.68rem;">New</span> }
                </div>
              </div>
              <div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-top:0.5rem;">
                @if (!item.read) { <button class="chip" type="button" (click)="markRead(item)">Mark read</button> }
                <button class="chip" type="button" (click)="deleteNotif(item)">Delete</button>
              </div>
            </article>
          }
        }
      </div>
    </section>
  `,
})
export class InstructorNotificationsComponent implements OnInit {
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

  protected markRead(item: any) { this.api.markNotificationRead(item.notificationId).subscribe({ next: () => this.load() }); }
  protected markAllRead() {
    const uid = this.auth.userId();
    if (uid) this.api.markAllNotificationsRead(uid).subscribe({ next: () => this.load() });
  }
  protected deleteNotif(item: any) { this.api.deleteNotification(item.notificationId).subscribe({ next: () => this.load() }); }
}
