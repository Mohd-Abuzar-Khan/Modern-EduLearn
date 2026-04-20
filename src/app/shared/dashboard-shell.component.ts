import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { instructorNavItems, studentNavItems, adminNavItems, NavItem } from './app-data';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="dashboard-shell" [class.dashboard-shell--instructor]="isInstructor" [class.dashboard-shell--student]="isStudent" [class.dashboard-shell--admin]="isAdmin">
      <header class="topbar glass-card">
        <button class="chip" type="button" (click)="sidebarCollapsed = !sidebarCollapsed">Menu</button>
        <div class="topbar-actions">
           <!-- Notification Bell -->
          <div class="notif-wrapper" style="position: relative; margin-right: 0.5rem;">
            <button class="chip notif-chip" (click)="toggleNotifs($event)" style="border:none; background: rgba(255,255,255,0.05); color: inherit;">
              <span style="font-size: 1.1rem;">🔔</span>
              @if (unreadCount() > 0) {
                <span class="notif-badge">{{ unreadCount() }}</span>
              }
            </button>

            <!-- Notif Dropdown -->
            @if (showNotifs()) {
              <div class="notif-dropdown glass-card animate-in">
                <div class="notif-header">
                  <h4 style="margin:0; font-size: 1rem;">Notifications</h4>
                  <button (click)="markAllRead()" class="mark-all-btn">Mark all read</button>
                </div>
                <div class="notif-list custom-scrollbar">
                  @for (n of notifications(); track n.notificationId) {
                    <div class="notif-item" [class.unread]="!n.isRead" (click)="markRead(n)">
                      <div class="notif-indicator"></div>
                      <div class="notif-content">
                        <div class="notif-title">{{ n.title }}</div>
                        <div class="notif-msg">{{ n.message }}</div>
                        <div class="notif-time">{{ n.createdAt | date:'shortTime' }}</div>
                      </div>
                    </div>
                  }
                  @if (notifications().length === 0) {
                    <div class="notif-empty">
                      <p>All caught up! ✨</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <a [routerLink]="profilePath" class="chip notif-chip" style="position:relative;text-decoration:none;">Profile</a>
          <span class="avatar">{{ initials() }}</span>
        </div>
      </header>

      <div class="dashboard-body" [class.dashboard-body--sidebar-collapsed]="sidebarCollapsed">
        <aside class="sidebar glass-card" [class.sidebar-collapsed]="sidebarCollapsed">
          <div class="sidebar-top">
            <div>
              <div class="pill">EduLearn</div>
              <h2 class="section-title" style="margin-top: 0.6rem;">{{ title }}</h2>
            </div>
            @if (userName()) {
              <p class="page-copy" style="font-size:0.8rem;margin-top:0.3rem;opacity:0.7;">{{ userName() }}</p>
            }
          </div>
          <nav class="sidebar-nav">
            @for (item of navItems; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="isExact(item.path) ? { exact: true } : { exact: false }">
                {{ item.label }}
              </a>
            }
          </nav>

          <div class="sidebar-logout-wrap">
            <button class="btn-secondary sidebar-logout" type="button" (click)="logout()">Logout</button>
          </div>
        </aside>

        <main class="content-wrap">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: `
    .notif-chip { cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; transition: all 0.3s; }
    .notif-chip:hover { background: rgba(255,255,255,0.15) !important; transform: translateY(-2px); }
    .notif-badge { position: absolute; top: -5px; right: -5px; background: #ff4d4f; color: white; border-radius: 50%; padding: 0.1rem 0.4rem; font-size: 0.65rem; font-weight: bold; border: 2px solid #1a1a1a; }
    .notif-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 320px; max-height: 440px; z-index: 9999; padding: 0; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 20px 40px rgba(0,0,0,0.6); border-radius: 20px; background: rgba(26, 32, 26, 0.98); backdrop-filter: blur(20px); }
    .notif-header { padding: 1.2rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.2); }
    .mark-all-btn { background: transparent; border: none; color: var(--el-primary); cursor: pointer; font-size: 0.8rem; font-weight: 500; }
    .mark-all-btn:hover { text-decoration: underline; }
    
    .notif-list { overflow-y: auto; max-height: 380px; }
    .notif-item { padding: 1.1rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; display: flex; gap: 0.9rem; transition: background 0.2s; position: relative; }
    .notif-item:hover { background: rgba(255,255,255,0.08); }
    .notif-item.unread { background: rgba(106, 170, 106, 0.15); }
    .notif-indicator { width: 10px; height: 10px; background: var(--el-accent); border-radius: 50%; margin-top: 0.3rem; flex-shrink: 0; opacity: 0; box-shadow: 0 0 10px var(--el-accent); }
    .unread .notif-indicator { opacity: 1; }
    .notif-title { font-weight: 600; font-size: 0.95rem; color: #fff; }
    .notif-msg { font-size: 0.85rem; opacity: 0.75; margin-top: 0.35rem; line-height: 1.4; color: #eee; }
    .notif-time { font-size: 0.7rem; opacity: 0.5; margin-top: 0.5rem; text-transform: uppercase; }
    .notif-empty { padding: 3rem 1rem; text-align: center; opacity: 0.6; font-size: 0.9rem; }
    
    .animate-in { animation: slideDownIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideDownIn { from { opacity: 0; transform: translateY(-10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
  `,
})
export class DashboardShellComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private navSub?: Subscription;
  private pollSub?: any;

  protected sidebarCollapsed = true;
  protected showNotifs = signal(false);
  protected unreadCount = signal(0);
  protected notifications = signal<any[]>([]);

  protected isStudent = false;
  protected isInstructor = false;
  protected isAdmin = false;
  protected title = 'Dashboard';
  protected navItems: NavItem[] = instructorNavItems;
  protected profilePath = '/student/profile';
  protected initials = signal('U');
  protected userName = signal('');

  constructor() {
    this.updateFromAuth();
    const updateShell = (): void => this.updateFromUrl();
    updateShell();
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(updateShell);
  }

  ngOnInit() {
    this.refreshNotifs();
    // Poll for notifications every 20 seconds for a "live" feel
    this.pollSub = setInterval(() => this.refreshNotifs(), 20000);
  }

  ngOnDestroy() {
    this.navSub?.unsubscribe();
    if (this.pollSub) clearInterval(this.pollSub);
  }

  protected toggleNotifs(event: Event) {
    event.stopPropagation();
    this.showNotifs.update(v => !v);
    if (this.showNotifs()) {
      this.refreshNotifs();
    }
  }

  private refreshNotifs() {
    const uid = this.auth.userId();
    if (!uid) return;

    this.api.getUnreadCount(uid).subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => {} // Silent fail to not break UI
    });
    
    this.api.getNotifications(uid).subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this.notifications.set(data.slice(0, 10)); // Top 10 for performance
      },
      error: () => {}
    });
  }

  protected markRead(n: any) {
    if (n.isRead) return;
    this.api.markNotificationRead(n.notificationId).subscribe(() => this.refreshNotifs());
  }

  protected markAllRead() {
    const uid = this.auth.userId();
    if (!uid) return;
    this.api.markAllNotificationsRead(uid).subscribe(() => this.refreshNotifs());
  }

  private updateFromAuth() {
    const user = this.auth.user();
    if (user) {
      const parts = user.fullName?.trim().split(' ') ?? [];
      this.initials.set(parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? 'U'));
      this.userName.set(user.fullName ?? '');
    }
  }

  private updateFromUrl() {
    const url = this.router.url;
    this.isStudent = url.startsWith('/student');
    this.isInstructor = url.startsWith('/instructor');
    this.isAdmin = url.startsWith('/admin');
    if (this.isStudent) {
      this.title = 'Student';
      this.navItems = studentNavItems;
      this.profilePath = '/student/profile';
    } else if (this.isInstructor) {
      this.title = 'Instructor';
      this.navItems = instructorNavItems;
      this.profilePath = '/instructor/profile';
    } else if (this.isAdmin) {
      this.title = 'Admin';
      this.navItems = adminNavItems;
      this.profilePath = '/admin';
    }
  }

  protected isExact(path: string): boolean {
    return path === '/student' || path === '/instructor' || path === '/admin';
  }

  protected logout(): void {
    this.auth.logout();
  }
}
