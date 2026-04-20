import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-student-quizzes',
  imports: [FormsModule, DatePipe],
  template: `
    <section>
      @if (!activeQuiz()) {
        <span class="pill">Assessments</span>
        <h1 class="page-title" style="margin-top:0.55rem;">Quizzes</h1>

        <div style="display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap;margin:1rem 0 0.5rem;">
          <label style="display:flex;align-items:center;gap:0.5rem;">
            <span class="page-copy" style="font-size:0.85rem;">Course ID:</span>
            <input class="el-input" type="number" [(ngModel)]="courseId" style="width:90px;" />
          </label>
          <button class="btn-secondary" type="button" (click)="loadQuizzes()">Load Quizzes</button>
        </div>

        @if (loading()) { <p class="page-copy" style="margin-top:0.8rem;">Loading…</p> }

        <div class="grid-cards quiz-cards-grid" style="margin-top:1rem;">
          @for (quiz of quizzes(); track quiz.quizId) {
            <article class="glass-card compact-card" style="border-radius:18px;">
              <h3 class="section-title card-title">{{ quiz.title }}</h3>
              <p class="page-copy" style="margin-top:0.35rem;font-size:0.82rem;">
                Time: {{ quiz.timeLimitMinutes }}min · Pass: {{ quiz.passingScore }}% · Attempts: {{ quiz.maxAttempts }}
              </p>
              @if (bestScores()[quiz.quizId] != null) {
                <p class="page-copy" style="font-size:0.8rem;color:#6aaa6a;margin-top:0.3rem;">Best: {{ bestScores()[quiz.quizId] }}%</p>
              }
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.85rem;">
                <span class="pill">{{ quiz.published ? 'Available' : 'Draft' }}</span>
                @if (quiz.published) {
                  <button class="btn-secondary" type="button" (click)="startQuiz(quiz)">
                    {{ bestScores()[quiz.quizId] != null ? 'Retake' : 'Start' }}
                  </button>
                }
              </div>
            </article>
          }
          @if (quizzes().length === 0 && !loading()) {
            <p class="page-copy">No quizzes found for this course.</p>
          }
        </div>

        <!-- Past attempts -->
        @if (attempts().length > 0) {
          <h2 class="section-title" style="font-size:1.1rem;margin-top:1.5rem;margin-bottom:0.7rem;">Past Attempts</h2>
          <div style="display:grid;gap:0.5rem;">
            @for (a of attempts(); track a.attemptId) {
              <div class="soft-card" style="padding:0.75rem;border-radius:12px;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;">
                <div>
                  <strong style="font-family:'Space Grotesk',sans-serif;color:var(--el-text-primary);font-size:0.9rem;">Quiz #{{ a.quizId }}</strong>
                  <p class="page-copy" style="font-size:0.78rem;">{{ a.submittedAt | date:'medium' }}</p>
                </div>
                <div style="text-align:right;">
                  <strong style="font-family:'Space Grotesk',sans-serif;" [style.color]="a.passed ? '#6aaa6a' : '#e05c5c'">
                    {{ a.score != null ? a.score + '%' : 'In progress' }}
                  </strong>
                  @if (a.submittedAt) {
                    <p class="page-copy" style="font-size:0.78rem;">{{ a.passed ? 'Passed' : 'Failed' }}</p>
                  }
                </div>
              </div>
            }
          </div>
        }
      } @else {
        <!-- Quiz taking UI -->
        <div class="quiz-shell glass-card">
          <div class="quiz-head-row">
            <div>
              <p class="page-copy quiz-breadcrumb">{{ activeQuiz()!.title }}</p>
              <h1 class="page-title" style="margin-top:0.35rem;">Question {{ currentQ() + 1 }} of {{ questions().length }}</h1>
            </div>
            <div class="quiz-timer soft-card" [style.color]="timeLeft() < 60 ? '#e05c5c' : 'inherit'">
              {{ formatTime(timeLeft()) }}
            </div>
          </div>

          <div class="quiz-progress-track">
            <div class="quiz-progress-fill" [style.width.%]="((currentQ() + 1) / questions().length) * 100"></div>
          </div>

          @if (questions().length > 0) {
            <div class="quiz-question-card soft-card">
              <p class="quiz-question-text">{{ questions()[currentQ()].questionText }}</p>
              <div class="quiz-options">
                @for (opt of questions()[currentQ()].options; track opt) {
                  <button class="quiz-option" type="button"
                    [class.quiz-option--selected]="answers()[questions()[currentQ()].questionId] === opt"
                    (click)="selectAnswer(questions()[currentQ()].questionId, opt)">
                    {{ opt }}
                  </button>
                }
              </div>
            </div>

            <div class="quiz-nav">
              <button class="btn-secondary" type="button" (click)="prevQ()" [disabled]="currentQ() === 0">Back</button>
              @if (currentQ() < questions().length - 1) {
                <button class="el-btn" type="button" style="width:auto;padding-inline:1.2rem;" (click)="nextQ()">Next</button>
              } @else {
                <button class="el-btn" type="button" style="width:auto;padding-inline:1.2rem;" (click)="submitQuiz()" [disabled]="submitting()">
                  {{ submitting() ? 'Submitting…' : 'Submit Quiz' }}
                </button>
              }
            </div>
          }
        </div>
      }

      @if (resultMsg()) {
        <article class="glass-card" style="padding:1.2rem;border-radius:16px;margin-top:1rem;text-align:center;">
          <h2 class="section-title" style="font-size:1.3rem;">{{ resultMsg() }}</h2>
          <p class="page-copy" style="margin-top:0.4rem;">Score: <strong>{{ resultScore() }}%</strong></p>
          <button class="btn-secondary" type="button" style="margin-top:0.8rem;" (click)="resetQuiz()">Back to Quizzes</button>
        </article>
      }
    </section>
  `,
  styles: `
    .quiz-shell { padding: 1.2rem; border-radius: 20px; display: grid; gap: 1rem; }
    .quiz-head-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .quiz-timer { padding: 0.5rem 1rem; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 600; }
    .quiz-progress-track { height: 5px; border-radius: 999px; background: rgba(255,255,255,0.1); overflow: hidden; }
    .quiz-progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg,#6aaa6a,#b9d9a0); transition: width 0.3s; }
    .quiz-question-card { padding: 1rem; border-radius: 14px; display: grid; gap: 0.8rem; }
    .quiz-question-text { font-family: 'Space Grotesk', sans-serif; font-size: 1rem; color: var(--el-text-primary); }
    .quiz-options { display: grid; gap: 0.5rem; }
    .quiz-option { text-align: left; padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: var(--el-text-secondary); cursor: pointer; transition: all 0.15s; }
    .quiz-option:hover { background: rgba(255,255,255,0.08); }
    .quiz-option--selected { border-color: rgba(106,170,106,0.6); background: rgba(106,170,106,0.12); color: var(--el-text-primary); }
    .quiz-nav { display: flex; justify-content: space-between; align-items: center; }
  `,
})
export class StudentQuizzesComponent implements OnInit {
  protected quizzes = signal<any[]>([]);
  protected questions = signal<any[]>([]);
  protected attempts = signal<any[]>([]);
  protected bestScores = signal<Record<number, number>>({});
  protected activeQuiz = signal<any | null>(null);
  protected activeAttemptId = signal<number | null>(null);
  protected currentQ = signal(0);
  protected answers = signal<Record<number, string>>({});
  protected loading = signal(false);
  protected submitting = signal(false);
  protected timeLeft = signal(900);
  protected resultMsg = signal('');
  protected resultScore = signal(0);
  protected courseId = 1;
  private timer: any;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const uid = this.auth.userId();
    if (uid) {
      this.api.getAttemptsByStudent(uid).subscribe({
        next: (data: any[]) => {
          this.attempts.set(data ?? []);
          const scores: Record<number, number> = {};
          (data ?? []).forEach((a: any) => {
            if (a.score != null && (scores[a.quizId] == null || a.score > scores[a.quizId])) {
              scores[a.quizId] = a.score;
            }
          });
          this.bestScores.set(scores);
        },
      });
    }
  }

  ngOnDestroy() { clearInterval(this.timer); }

  protected loadQuizzes() {
    if (!this.courseId) return;
    this.loading.set(true);
    this.api.getQuizzesByCourse(this.courseId).subscribe({
      next: (data: any[]) => { this.quizzes.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected startQuiz(quiz: any) {
    const uid = this.auth.userId();
    if (!uid) return;
    this.api.startAttempt(quiz.quizId, uid).subscribe({
      next: (attempt: any) => {
        this.activeAttemptId.set(attempt.attemptId);
        this.activeQuiz.set(quiz);
        this.timeLeft.set((quiz.timeLimitMinutes ?? 15) * 60);
        this.currentQ.set(0);
        this.answers.set({});
        this.resultMsg.set('');
        this.api.getQuestionsByQuiz(quiz.quizId).subscribe({
          next: (qs: any[]) => { this.questions.set(qs ?? []); },
        });
        this.timer = setInterval(() => {
          this.timeLeft.update(t => {
            if (t <= 1) { clearInterval(this.timer); this.submitQuiz(); return 0; }
            return t - 1;
          });
        }, 1000);
      },
      error: (err: any) => alert(err?.error?.message ?? 'Could not start quiz. Max attempts may have been reached.'),
    });
  }

  protected selectAnswer(questionId: number, option: string) {
    this.answers.update(a => ({ ...a, [questionId]: option }));
  }

  protected nextQ() { if (this.currentQ() < this.questions().length - 1) this.currentQ.update(q => q + 1); }
  protected prevQ() { if (this.currentQ() > 0) this.currentQ.update(q => q - 1); }

  protected submitQuiz() {
    const aid = this.activeAttemptId();
    if (!aid) return;
    clearInterval(this.timer);
    this.submitting.set(true);
    this.api.submitAttempt(aid, this.answers()).subscribe({
      next: (result: any) => {
        this.submitting.set(false);
        this.resultScore.set(result.score ?? 0);
        this.resultMsg.set(result.passed ? 'Congratulations! You passed!' : 'Quiz submitted. Keep practicing!');
        this.activeQuiz.set(null);
        this.ngOnInit();
      },
      error: () => { this.submitting.set(false); this.resultMsg.set('Submission failed. Please try again.'); this.activeQuiz.set(null); },
    });
  }

  protected resetQuiz() { this.resultMsg.set(''); this.activeQuiz.set(null); }

  protected formatTime(s: number): string {
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}
