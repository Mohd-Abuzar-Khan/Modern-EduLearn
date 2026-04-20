import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-admin-users',
  imports: [DatePipe],
  template: `
    <section>
      <span class="pill">Admin</span>
      <h1 class="page-title" style="font-size: clamp(1.8rem, 3.2vw, 2.6rem); margin-top: 0.75rem;">Users</h1>
      <p class="page-copy" style="margin-top: 0.35rem;">{{ filteredUsers().length }} users shown</p>

      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
        @for (tab of roleTabs; track tab) {
          <button class="chip" type="button" [class.role-option--active]="activeTab() === tab" (click)="filterByRole(tab)">{{ tab }}</button>
        }
      </div>

      @if (loading()) {
        <div style="text-align: center; padding: 2rem; margin-top: 1rem;">
          <p class="page-copy">Loading users...</p>
        </div>
      } @else if (endpointMissing()) {
        <article class="glass-card" style="padding: 2rem; margin-top: 1rem; text-align: center; border-radius: 18px;">
          <h3 class="section-title">Endpoint not found</h3>
          <p class="page-copy" style="margin-top: 0.5rem; color: #e6b065;">
            User management requires the GET /auth/users endpoint to be added to auth-service (see backend docs).
          </p>
        </article>
      } @else {
        <div class="user-table-wrap" style="margin-top: 1rem; overflow-x: auto;">
          <table class="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredUsers(); track user.userId) {
                <tr>
                  <td><strong>{{ user.fullName }}</strong></td>
                  <td>{{ user.email }}</td>
                  <td><span class="role-badge" [attr.data-role]="user.role">{{ user.role }}</span></td>
                  <td>{{ user.createdAt | date:'mediumDate' }}</td>
                  <td>
                    <button class="action-btn-small" type="button" title="Delete user" (click)="deleteUser(user)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </td>
                </tr>
              }

              @if (filteredUsers().length === 0) {
                <tr>
                  <td colspan="5" style="text-align: center; padding: 1.5rem;">No users found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: `
    .user-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    .user-table th,
    .user-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .user-table th {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.5;
      font-weight: 600;
    }

    .user-table tr:hover td {
      background: rgba(255, 255, 255, 0.04);
    }

    .role-badge {
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(106, 170, 106, 0.15);
      color: #6aaa6a;
    }

    .role-badge[data-role="ADMIN"] {
      background: rgba(200, 150, 50, 0.15);
      color: #c89632;
    }

    .role-badge[data-role="INSTRUCTOR"] {
      background: rgba(106, 150, 200, 0.15);
      color: #6a96c8;
    }

    .action-btn-small {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.04);
      color: var(--el-text-secondary);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      display: grid;
      place-items: center;
    }

    .action-btn-small:hover {
      background: rgba(200, 50, 50, 0.15);
      border-color: rgba(200, 50, 50, 0.35);
      color: #e05c5c;
    }
  `,
})
export class AdminUsersComponent implements OnInit {
  protected readonly roleTabs = ['All', 'STUDENT', 'INSTRUCTOR', 'ADMIN'];
  protected readonly activeTab = signal('All');
  protected readonly users = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly endpointMissing = signal(false);

  protected readonly filteredUsers = computed(() => {
    const tab = this.activeTab();
    if (tab === 'All') return this.users();
    return this.users().filter(u => u.role === tab);
  });

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  filterByRole(tab: string) {
    this.activeTab.set(tab);
  }

  deleteUser(user: any) {
    if (!confirm(`Are you sure you want to delete ${user.fullName}?`)) return;
    this.api.deleteUser(user.userId).subscribe({
      next: () => {
        this.users.set(this.users().filter(u => u.userId !== user.userId));
      },
      error: (err: any) => {
        alert(err?.error?.message || 'Failed to delete user');
      },
    });
  }

  private loadUsers() {
    this.loading.set(true);
    this.endpointMissing.set(false);
    this.api.getAllUsers().subscribe({
      next: (res: any) => {
        this.users.set(Array.isArray(res) ? res : (res.data || []));
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 404 || err.status === 0 || err.status === 500) {
          this.endpointMissing.set(true);
        }
      },
    });
  }
}
