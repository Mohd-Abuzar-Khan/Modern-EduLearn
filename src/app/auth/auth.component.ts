import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-shell">
      <div class="el-grain"></div>
      <header class="landing-topbar">
        <a routerLink="/" class="brand-mark brand-link">EDULEARN</a>
      </header>

      <main class="auth-main">
        <div class="auth-wrapper" [class.auth-wrapper--register]="mode() === 'register'">
          
          <!-- Left Panel (Only visible on register tab) -->
          @if (mode() === 'register') {
            <article class="glass-card left-panel desktop-only">
              <div class="left-panel-content">
                <h2 class="brand-mark" style="font-size: 2rem; margin-bottom: 1rem;">EDULEARN</h2>
                <p style="font-size: 1.2rem; margin-bottom: 3rem; font-weight: 500; opacity: 0.9;">Learn Anytime. Grow Everywhere.</p>
                
                <div class="step-indicators">
                  <div class="step-item">
                    <div class="step-circle active">1</div>
                    <span>Sign up your account</span>
                  </div>
                  <div class="step-item">
                    <div class="step-circle">2</div>
                    <span>Set up your workspace</span>
                  </div>
                  <div class="step-item">
                    <div class="step-circle">3</div>
                    <span>Set up your profile</span>
                  </div>
                </div>
              </div>
            </article>
          }

          <article class="glass-card auth-card">
            <div class="auth-tabs">
              <button class="auth-tab" [class.auth-tab--active]="mode() === 'login'" (click)="mode.set('login')">Sign In</button>
              <button class="auth-tab" [class.auth-tab--active]="mode() === 'register'" (click)="mode.set('register')">Register</button>
            </div>

            @if (mode() === 'login') {
              <h1 class="page-title auth-title">Welcome back</h1>
              <p class="page-copy" style="margin-top:0.35rem;">Sign in to continue your learning journey.</p>

              <form class="auth-form" (ngSubmit)="doLogin()">
                <label style="display:grid;gap:0.4rem;">
                  <span class="page-copy">Email</span>
                  <input class="el-input" type="email" [(ngModel)]="loginEmail" name="email" placeholder="you@example.com" required />
                </label>
                <label style="display:grid;gap:0.4rem;">
                  <span class="page-copy">Password</span>
                  <div style="position: relative; display: flex; align-items: center;">
                    <input class="el-input" [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="loginPassword" name="password" placeholder="••••••••" required style="width: 100%; padding-right: 2.5rem;" />
                    <button type="button" class="pwd-toggle" (click)="showPassword.set(!showPassword())">
                      {{ showPassword() ? '●' : '👁' }}
                    </button>
                  </div>
                </label>

                <button class="el-btn auth-submit" type="submit" [disabled]="loading()">
                  {{ loading() ? 'Signing in…' : 'Sign In' }}
                </button>
              </form>
            }
            
            @if (error()) {
                <p class="auth-error" style="margin-top: 1rem;">{{ error() }}</p>
            }
            @if (success()) {
                <p class="auth-success" style="margin-top: 1rem;">{{ success() }}</p>
            }

            @if (mode() === 'register') {
              <h1 class="page-title auth-title">Create account</h1>
              <p class="page-copy" style="margin-top:0.35rem;">Join thousands of learners and instructors.</p>

              <form class="auth-form" (ngSubmit)="doRegister()">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <label style="display:grid;gap:0.4rem;">
                    <span class="page-copy">First Name</span>
                    <input class="el-input" type="text" [(ngModel)]="regFirstName" name="firstName" placeholder="First Name" required />
                  </label>
                  <label style="display:grid;gap:0.4rem;">
                    <span class="page-copy">Last Name</span>
                    <input class="el-input" type="text" [(ngModel)]="regLastName" name="lastName" placeholder="Last Name" required />
                  </label>
                </div>
                <label style="display:grid;gap:0.4rem;">
                  <span class="page-copy">Email</span>
                  <input class="el-input" type="email" [(ngModel)]="regEmail" name="email" placeholder="you@example.com" required />
                </label>
                <label style="display:grid;gap:0.4rem;">
                  <span class="page-copy">Password</span>
                  <div style="position: relative; display: flex; align-items: center;">
                    <input class="el-input" [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="regPassword" name="password" placeholder="At least 8 characters" required style="width: 100%; padding-right: 2.5rem;" />
                    <button type="button" class="pwd-toggle" (click)="showPassword.set(!showPassword())">
                      {{ showPassword() ? '●' : '👁' }}
                    </button>
                  </div>
                </label>
                <label style="display:grid;gap:0.4rem;">
                  <span class="page-copy">I am a…</span>
                  <select class="el-input" [(ngModel)]="regRole" name="role">
                    <option value="STUDENT">Student</option>
                    <option value="INSTRUCTOR">Instructor</option>
                  </select>
                </label>

                <button class="el-btn auth-submit" type="submit" [disabled]="loading()">
                  {{ loading() ? 'Creating account…' : 'Create Account' }}
                </button>
              </form>
            }
          </article>
        </div>
      </main>
    </div>
  `,
  styles: `
    .auth-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .auth-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    
    .auth-wrapper {
      width: 100%;
      max-width: 420px;
      display: grid;
      transition: all 0.3s ease;
    }
    .auth-wrapper.auth-wrapper--register {
      max-width: 850px;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    
    .left-panel {
      background: var(--el-banner-green);
      padding: 3rem 2rem;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      color: #fff;
    }
    
    .step-indicators {
      display: grid;
      gap: 1.5rem;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1.05rem;
      opacity: 0.95;
    }
    .step-circle {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: bold;
    }
    .step-circle.active {
      background: #fff;
      color: #1b5e20;
    }
    
    .auth-card {
      padding: 1.75rem;
      border-radius: 20px;
      height: 100%;
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      color: #fff;
    }

    .auth-card .page-title {
      color: #fff !important;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .auth-card .page-copy {
      color: rgba(255, 255, 255, 0.8) !important;
      font-size: 0.95rem;
    }

    .auth-card .field span {
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.85rem;
      text-transform: none;
      letter-spacing: normal;
    }

    .auth-card .el-input {
      background: rgba(255, 255, 255, 0.15) !important;
      border: 1px solid rgba(255, 255, 255, 0.25) !important;
      color: #fff !important;
      border-radius: 12px;
    }

    .auth-card .el-input::placeholder {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    .auth-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    .auth-tab {
      flex: 1;
      padding: 0.65rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .auth-tab--active {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
      color: #fff !important;
      font-weight: 500;
    }
    .auth-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
    }
    .auth-form {
      display: grid;
      gap: 1rem;
      margin-top: 1.25rem;
    }
    .auth-submit {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.85rem;
      background: #fff !important;
      color: #1a1a1a !important;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      border: none;
      transition: transform 0.2s ease, box-shadow 0.2s;
    }
    .auth-submit:hover {
      background: #f0f0f0 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255,255,255,0.2);
    }
    .auth-error {
      color: #d32f2f;
      font-size: 0.85rem;
    }
    .auth-success {
      color: #1b5e20;
      font-size: 0.85rem;
    }
    .pwd-toggle {
      position: absolute;
      right: 0.8rem;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      opacity: 0.6;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pwd-toggle:hover {
      opacity: 1;
    }

    @media (max-width: 768px) {
      .auth-wrapper.auth-wrapper--register {
        grid-template-columns: 1fr;
        max-width: 420px;
      }
      .desktop-only {
        display: none !important;
      }
    }
  `,
})
export class AuthComponent {
  protected mode = signal<'login' | 'register'>('login');
  protected loading = signal(false);
  protected error = signal('');
  protected success = signal('');
  protected showPassword = signal(false);

  protected loginEmail = '';
  protected loginPassword = '';
  protected regFirstName = '';
  protected regLastName = '';
  protected regEmail = '';
  protected regPassword = '';
  protected regRole = 'STUDENT';

  private auth = inject(AuthService);

  constructor() {
    // Check query param for initial tab
  }

  protected doLogin() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.loginEmail, this.loginPassword).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (!res.success) this.error.set(res.message ?? 'Login failed');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Login failed. Please check your credentials.');
      },
    });
  }

  protected doRegister() {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);
    
    const regFullName = this.regFirstName.trim() + ' ' + this.regLastName.trim();

    this.auth.register(this.regEmail, regFullName, this.regPassword, this.regRole).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.success) {
          this.success.set('Account created! You can now sign in.');
          this.mode.set('login');
          this.loginEmail = this.regEmail;
        } else {
          this.error.set(res.message ?? 'Registration failed');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Registration failed.');
      },
    });
  }
}

