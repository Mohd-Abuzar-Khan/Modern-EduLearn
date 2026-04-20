import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-student-profile',
  imports: [FormsModule],
  template: `
    <section>
      <span class="pill">Account</span>
      <h1 class="page-title" style="font-size: clamp(1.8rem, 3.2vw, 2.6rem); margin-top: 0.75rem;">Profile</h1>

      <div class="profile-layout">
        <aside class="glass-card profile-summary">
          <div class="profile-avatar">{{ initials() }}</div>
          <h2 class="profile-name">{{ fullName }}</h2>
          <p class="page-copy" style="font-size: 0.82rem;">Student</p>
        </aside>

        <div class="profile-main">
          <article class="glass-card profile-card">
            <div class="section-header-row">
              <h2 class="section-title">Student Details</h2>
              <span class="chip">Editable</span>
            </div>

            <form class="profile-form" novalidate (ngSubmit)="saveProfile()">
              <label class="profile-field">
                <span class="page-copy">Full name</span>
                <input class="el-input" type="text" [(ngModel)]="fullName" name="fullName" />
              </label>

              <label class="profile-field">
                <span class="page-copy">Email</span>
                <input class="el-input" type="email" [value]="email" readonly style="opacity: 0.6;" />
              </label>

              <label class="profile-field">
                <span class="page-copy">Bio</span>
                <input class="el-input" type="text" [(ngModel)]="bio" name="bio" placeholder="Tell us about yourself..." />
              </label>

              <label class="profile-field">
                <span class="page-copy">Mobile</span>
                <input class="el-input" type="text" [(ngModel)]="mobile" name="mobile" placeholder="+1 234 567 890" />
              </label>

              <div class="profile-actions">
                @if (saveMsg()) {
                  <span class="page-copy" [style.color]="saveMsg().includes('success') ? '#6aaa6a' : '#e05c5c'" style="font-size: 0.82rem; align-self: center;">{{ saveMsg() }}</span>
                }
                <button class="el-btn" type="submit" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save changes' }}</button>
              </div>
            </form>
          </article>

          <article class="glass-card profile-card">
            <div class="section-header-row">
              <h2 class="section-title">Change Password</h2>
            </div>

            <form class="profile-form" novalidate (ngSubmit)="changePassword()">
              <label class="profile-field">
                <span class="page-copy">Current password</span>
                <input class="el-input" type="password" [(ngModel)]="oldPassword" name="oldPassword" />
              </label>

              <label class="profile-field">
                <span class="page-copy">New password</span>
                <input class="el-input" type="password" [(ngModel)]="newPassword" name="newPassword" />
              </label>

              <label class="profile-field">
                <span class="page-copy">Confirm new password</span>
                <input class="el-input" type="password" [(ngModel)]="confirmPassword" name="confirmPassword" />
              </label>

              <div class="profile-actions">
                @if (pwdMsg()) {
                  <span class="page-copy" [style.color]="pwdMsg().includes('success') ? '#6aaa6a' : '#e05c5c'" style="font-size: 0.82rem; align-self: center;">{{ pwdMsg() }}</span>
                }
                <button class="el-btn" type="submit" [disabled]="changingPwd()">{{ changingPwd() ? 'Changing…' : 'Change password' }}</button>
              </div>
            </form>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: `
    .profile-layout {
      display: grid;
      grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
      gap: 1rem;
      margin-top: 1rem;
      align-items: start;
    }

    .profile-summary {
      border-radius: 18px;
      padding: 1rem;
      display: grid;
      gap: 0.9rem;
    }

    .profile-avatar {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.2rem;
      color: var(--el-text-primary);
      background: rgba(106, 170, 106, 0.2);
      border: 1px solid rgba(106, 170, 106, 0.35);
    }

    .profile-name {
      margin: 0;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.35rem;
      line-height: 1.2;
    }

    .profile-main {
      display: grid;
      gap: 1rem;
    }

    .profile-card {
      border-radius: 18px;
      padding: 1.1rem;
      display: grid;
      gap: 0.95rem;
    }

    .section-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
    }

    .profile-form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.85rem;
    }

    .profile-field {
      display: grid;
      gap: 0.4rem;
    }

    .profile-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      padding-top: 0.35rem;
    }

    .profile-actions .el-btn {
      width: auto;
      min-width: 130px;
      padding-inline: 1rem;
    }

    @media (max-width: 980px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }

      .profile-form {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class StudentProfileComponent implements OnInit {
  fullName = '';
  email = '';
  bio = '';
  mobile = '';

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  saving = signal(false);
  saveMsg = signal('');
  changingPwd = signal(false);
  pwdMsg = signal('');

  initials = signal('');

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.fullName = user.fullName || '';
      this.email = user.email || '';
      this.initials.set(
        this.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      );
    }
  }

  saveProfile() {
    const uid = this.auth.userId();
    if (!uid) return;
    this.saving.set(true);
    this.saveMsg.set('');

    this.api.updateProfile({
      userId: uid,
      fullName: this.fullName,
      bio: this.bio,
      mobile: this.mobile,
    }).subscribe({
      next: (res: any) => {
        this.saving.set(false);
        if (res.success) {
          this.saveMsg.set('Profile updated successfully!');
          this.auth.updateUser({ fullName: this.fullName });
          this.initials.set(
            this.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
          );
        } else {
          this.saveMsg.set(res.message || 'Update failed');
        }
      },
      error: (err: any) => {
        this.saving.set(false);
        this.saveMsg.set(err?.error?.message || 'Update failed');
      },
    });
  }

  changePassword() {
    const uid = this.auth.userId();
    if (!uid) return;
    if (this.newPassword !== this.confirmPassword) {
      this.pwdMsg.set('New passwords do not match');
      return;
    }
    if (!this.newPassword || !this.oldPassword) {
      this.pwdMsg.set('Please fill in all password fields');
      return;
    }
    this.changingPwd.set(true);
    this.pwdMsg.set('');

    this.api.changePassword({
      userId: uid,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
    }).subscribe({
      next: (res: any) => {
        this.changingPwd.set(false);
        if (res.success) {
          this.pwdMsg.set('Password changed successfully!');
          this.oldPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.pwdMsg.set(res.message || 'Password change failed');
        }
      },
      error: (err: any) => {
        this.changingPwd.set(false);
        this.pwdMsg.set(err?.error?.message || 'Password change failed');
      },
    });
  }
}
