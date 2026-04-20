import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface QuestionDraft {
  id?: number;
  questionText: string;
  questionType: 'MCQ_SINGLE' | 'MCQ_MULTI' | 'TRUE_FALSE';
  optionsString: string;
  correctAnswer: string;
  marks: number;
}

@Component({
  selector: 'app-instructor-quiz-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <div>
          <span class="pill">Quiz Editor</span>
          <h1 class="page-title" style="font-size: clamp(2rem, 4vw, 3rem); margin-top: 0.8rem;">Quiz Builder</h1>
          <p class="page-copy" style="margin-top: 0.35rem;">Create assessments for Course ID: {{ courseId() }}</p>
        </div>
      </div>

      <div style="display: grid; gap: 2rem;">
        <!-- Quiz Settings Form -->
        <article class="glass-card" style="padding: 2rem; border-radius: 16px;">
          <h3 class="section-title" style="margin-bottom: 1.5rem;">Quiz Settings</h3>
          
          <div style="display: grid; gap: 1.5rem;">
            <div>
              <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Quiz Title *</label>
              <input type="text" class="el-input" [(ngModel)]="quizForm.title" placeholder="e.g. End of Course Assessment" />
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div>
                <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Course ID</label>
                <input type="number" class="el-input" [(ngModel)]="quizForm.courseId" readonly style="opacity: 0.7; cursor: not-allowed;" />
              </div>
              <div>
                <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Time Limit (mins)</label>
                <input type="number" class="el-input" [(ngModel)]="quizForm.timeLimit" />
              </div>
              <div>
                <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Passing Score (%)</label>
                <input type="number" class="el-input" [(ngModel)]="quizForm.passingScore" />
              </div>
              <div>
                <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Max Attempts</label>
                <input type="number" class="el-input" [(ngModel)]="quizForm.maxAttempts" />
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 2rem; align-items: center;">
            <button class="el-btn" (click)="saveQuiz()" [disabled]="saving()">
              {{ saving() ? 'Saving...' : 'Save Quiz' }}
            </button>
            <button class="btn-secondary" *ngIf="savedQuizId()" (click)="publishQuiz()" [disabled]="saving()">
              Publish Quiz
            </button>
            <span class="page-copy" style="color: #6aaa6a;" *ngIf="successMsg()">{{ successMsg() }}</span>
            <span class="page-copy" style="color: #e05c5c;" *ngIf="errorMsg()">{{ errorMsg() }}</span>
          </div>
        </article>

        <!-- Questions Section -->
        <article class="glass-card" style="padding: 2rem; border-radius: 16px;" *ngIf="savedQuizId()">
          <h3 class="section-title" style="margin-bottom: 1.5rem;">Questions</h3>

          <div style="display: grid; gap: 1.5rem; margin-bottom: 1.5rem;">
            @for (q of questions(); track $index) {
              <div class="soft-card" [style.border]="q.id ? '1px solid #4a7c4e' : 'none'" style="padding: 1.5rem; border-radius: 12px; display: grid; gap: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h4 class="page-copy" style="margin: 0; font-weight: 600;">Question {{ $index + 1 }}</h4>
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="pill" *ngIf="q.id" style="background: #2e3e30; color: #a5d6a7;">Saved (ID: {{ q.id }})</span>
                    <button class="chip" style="color: #e05c5c; cursor: pointer;" (click)="removeQuestion($index)">Remove</button>
                  </div>
                </div>

                <textarea class="el-input" rows="2" [(ngModel)]="q.questionText" placeholder="Enter question text"></textarea>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div>
                    <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem;">Question Type</label>
                    <select class="el-input" [(ngModel)]="q.questionType">
                      <option value="MCQ_SINGLE">Single Choice (MCQ)</option>
                      <option value="MCQ_MULTI">Multiple Choice</option>
                      <option value="TRUE_FALSE">True / False</option>
                    </select>
                  </div>
                  <div>
                    <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem;">Points / Marks</label>
                    <input type="number" class="el-input" [(ngModel)]="q.marks" />
                  </div>
                </div>

                <div *ngIf="q.questionType !== 'TRUE_FALSE'">
                  <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem;">Options separated by commas</label>
                  <input type="text" class="el-input" [(ngModel)]="q.optionsString" placeholder="Option A, Option B, Option C, Option D" />
                </div>

                <div>
                  <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem;">
                    Must exactly match one option for MCQ, or 'true'/'false' for TRUE_FALSE
                  </label>
                  <input type="text" class="el-input" [(ngModel)]="q.correctAnswer" placeholder="Type correct answer" />
                </div>
              </div>
            }
          </div>

          <div style="display: flex; gap: 1rem;">
            <button class="btn-secondary" (click)="addQuestionDraft()">+ Add Question</button>
            <button class="el-btn" *ngIf="questions().length > 0" (click)="saveAllQuestions()">Save All Questions</button>
          </div>
        </article>
      </div>
    </section>
  `
})
export class InstructorQuizBuilderComponent implements OnInit {
  protected courseId = signal<number | null>(null);
  protected savedQuizId = signal<number | null>(null);
  
  protected saving = signal(false);
  protected successMsg = signal('');
  protected errorMsg = signal('');

  protected quizForm = {
    title: '',
    courseId: 0,
    timeLimit: 15,
    passingScore: 60,
    maxAttempts: 3
  };

  protected questions = signal<QuestionDraft[]>([]);

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const cid = this.route.snapshot.queryParamMap.get('courseId');
    if (cid) {
      this.courseId.set(Number(cid));
      this.quizForm.courseId = Number(cid);
    }

    const qid = this.route.snapshot.queryParamMap.get('quizId');
    if (qid) {
      this.savedQuizId.set(Number(qid));
      this.loadQuiz(Number(qid));
    }
  }

  private loadQuiz(quizId: number) {
    this.api.getQuizById(quizId).subscribe({
      next: (res: any) => {
        const q = res.data || res;
        this.quizForm = {
          title: q.title || '',
          courseId: q.courseId || this.courseId() || 0,
          timeLimit: q.timeLimit || 15,
          passingScore: q.passingScore || 60,
          maxAttempts: q.maxAttempts || 3
        };
        // Also load questions
        this.api.getQuestionsByQuiz(quizId).subscribe({
          next: (qsRes: any) => {
            const list = qsRes.data || qsRes || [];
            this.questions.set(list.map((qq: any) => ({
              id: qq.questionId || qq.id,
              questionText: qq.questionText || '',
              questionType: qq.questionType || 'MCQ_SINGLE',
              optionsString: Array.isArray(qq.options) ? qq.options.join(', ') : (qq.options || ''),
              correctAnswer: qq.correctAnswer || '',
              marks: qq.marks || 1
            })));
          }
        });
      }
    });
  }

  protected saveQuiz() {
    if (!this.quizForm.title) {
      this.errorMsg.set('Quiz title is required.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');

    const payload = { ...this.quizForm };

    if (this.savedQuizId()) {
      this.api.updateQuiz(this.savedQuizId()!, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.successMsg.set('Quiz updated successfully.');
          setTimeout(() => this.successMsg.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.errorMsg.set('Failed to update quiz.');
        }
      });
    } else {
      this.api.createQuiz(payload).subscribe({
        next: (res: any) => {
          const id = res.data?.quizId || res.data?.id || res.quizId || res.id;
          this.savedQuizId.set(id);
          this.saving.set(false);
          this.successMsg.set('Quiz created successfully.');
          setTimeout(() => this.successMsg.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.errorMsg.set('Failed to create quiz.');
        }
      });
    }
  }

  protected publishQuiz() {
    const id = this.savedQuizId();
    if (!id) return;
    
    this.api.publishQuiz(id).subscribe({
      next: () => {
        this.successMsg.set('Quiz published successfully.');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => this.errorMsg.set('Failed to publish quiz.')
    });
  }

  protected addQuestionDraft() {
    this.questions.update(qs => [
      ...qs,
      {
        questionText: '',
        questionType: 'MCQ_SINGLE',
        optionsString: '',
        correctAnswer: '',
        marks: 1
      }
    ]);
  }

  protected removeQuestion(index: number) {
    this.questions.update(qs => qs.filter((_, i) => i !== index));
  }

  protected saveAllQuestions() {
    const qid = this.savedQuizId();
    if (!qid) return;

    this.questions().forEach((q, index) => {
      if (!q.id) {
        const payload = {
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.questionType === 'TRUE_FALSE' ? ['true', 'false'] : q.optionsString.split(',').map(o => o.trim()),
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          orderIndex: index + 1
        };

        this.api.addQuestion(qid, payload).subscribe({
          next: (res: any) => {
            q.id = res.data?.questionId || res.data?.id || res.questionId || res.id;
          }
        });
      }
    });
  }
}
