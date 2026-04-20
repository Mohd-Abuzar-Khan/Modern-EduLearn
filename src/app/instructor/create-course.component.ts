import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

interface LessonDraft {
  id?: number;
  title: string;
  contentType: 'VIDEO' | 'VIDEO_URL' | 'ARTICLE' | 'PDF';
  contentUrl: string;
  durationMinutes: number;
  description: string;
  isPreview: boolean;
  orderIndex: number;
  uploading: boolean;
  uploadProgress: number;
  selectedFile: File | null;
  uploaded: boolean;
  errorMsg: string;
}

@Component({
  selector: 'app-instructor-create-course',
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <div>
          <span class="pill">Course Editor</span>
          <h1 class="page-title" style="font-size: clamp(2rem, 4vw, 3rem); margin-top: 0.8rem;">
            {{ isEditMode() ? 'Edit Course' : 'Create Course' }}
          </h1>
          <p class="page-copy" style="margin-top: 0.35rem;">
            {{ isEditMode() ? 'Update your course details and curriculum.' : 'Start building your new course.' }}
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem;">
        <!-- Main Form -->
        <div style="display: grid; gap: 2rem;">
          <!-- Course Metadata Form -->
          <article class="glass-card" style="padding: 2rem; border-radius: 16px;">
            <h3 class="section-title" style="margin-bottom: 1.5rem;">Course Details</h3>
            
            <div style="display: grid; gap: 1.5rem;">
              <div>
                <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Course Title *</label>
                <input type="text" class="el-input" [ngModel]="courseForm.title()" (ngModelChange)="courseForm.title.set($event)" placeholder="e.g. Modern Web Development" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Category</label>
                  <select class="el-input" [ngModel]="courseForm.category()" (ngModelChange)="courseForm.category.set($event)">
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Level</label>
                  <select class="el-input" [ngModel]="courseForm.level()" (ngModelChange)="courseForm.level.set($event)">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div>
                  <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Price (₹)</label>
                  <input type="number" class="el-input" [ngModel]="courseForm.price()" (ngModelChange)="courseForm.price.set($event)" placeholder="0 = Free" />
                </div>
                <div>
                  <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Duration (mins)</label>
                  <input type="number" class="el-input" [ngModel]="courseForm.totalDuration()" (ngModelChange)="courseForm.totalDuration.set($event)" placeholder="e.g. 120" />
                </div>
                <div>
                  <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Language</label>
                  <input type="text" class="el-input" [ngModel]="courseForm.language()" (ngModelChange)="courseForm.language.set($event)" />
                </div>
              </div>

              <div>
                <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description</label>
                <textarea class="el-input" rows="4" [ngModel]="courseForm.description()" (ngModelChange)="courseForm.description.set($event)" placeholder="What will students learn?"></textarea>
              </div>

              <div>
                <label class="page-copy" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Thumbnail URL</label>
                <input type="text" class="el-input" [ngModel]="courseForm.thumbnailUrl()" (ngModelChange)="courseForm.thumbnailUrl.set($event)" placeholder="https://example.com/image.jpg" />
              </div>
            </div>

            <!-- Course Action Buttons -->
            <div style="display: flex; gap: 1rem; margin-top: 2rem; align-items: center;">
              <button class="el-btn" (click)="saveDraft()" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save Draft' }}
              </button>
              
              @if (savedCourseId() !== null) {
                <button class="btn-secondary" 
                        (click)="publishCourse()" 
                        [disabled]="saving()">
                  {{ isPublished() ? 'Pending Approval' : 'Submit for Review' }}
                </button>
              }

              @if (successMsg()) {
                <span class="page-copy" style="color: #6aaa6a;">{{ successMsg() }}</span>
              }
              @if (errorMsg()) {
                <span class="page-copy" style="color: #e05c5c;">{{ errorMsg() }}</span>
              }
            </div>
          </article>

          <!-- Lesson Manager (Visible only after course is saved) -->
          @if (savedCourseId() !== null) {
            <article class="glass-card" style="padding: 2rem; border-radius: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 class="section-title" style="margin: 0;">Lessons</h3>
              </div>

            <div style="display: grid; gap: 1.5rem; margin-bottom: 1.5rem;">
              @for (lesson of lessons(); track $index) {
                <div class="soft-card" style="padding: 1.5rem; border-radius: 12px; display: grid; gap: 1rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 class="page-copy" style="margin: 0; font-weight: 600;">Lesson {{ $index + 1 }}</h4>
                    <span class="pill" *ngIf="lesson.id" style="background: #2e3e30; color: #a5d6a7;">Saved</span>
                  </div>

                  <input type="text" class="el-input" [(ngModel)]="lesson.title" placeholder="Lesson Title" />
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <select class="el-input" [(ngModel)]="lesson.contentType">
                      <option value="VIDEO">Video Upload</option>
                      <option value="VIDEO_URL">Video URL (YouTube/Vimeo)</option>
                      <option value="ARTICLE">Article (URL)</option>
                      <option value="PDF">PDF Upload / URL</option>
                    </select>
                    <input type="number" class="el-input" [(ngModel)]="lesson.durationMinutes" placeholder="Duration (mins)" />
                  </div>

                  <textarea class="el-input" rows="2" [(ngModel)]="lesson.description" placeholder="Lesson Description"></textarea>

                  <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <input type="checkbox" [(ngModel)]="lesson.isPreview" />
                    <span class="page-copy">Make this lesson available as a free preview</span>
                  </label>

                  <!-- Content Input based on Type -->
                  <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    @if (lesson.contentType === 'VIDEO') {
                      <input type="file" accept="video/*" (change)="onFileSelected($event, lesson)" style="margin-bottom: 1rem; display: block; color: #fff;" />
                      
                      @if (lesson.selectedFile) {
                        <p class="page-copy" style="font-size: 0.8rem; margin-bottom: 0.5rem;">
                          Selected: {{ lesson.selectedFile.name }} ({{ (lesson.selectedFile.size / 1024 / 1024).toFixed(2) }} MB)
                        </p>
                      }

                      <button class="el-btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;" 
                              (click)="uploadVideo(lesson)" 
                              [disabled]="!lesson.selectedFile || lesson.uploading || lesson.uploaded">
                        {{ lesson.uploaded ? 'Uploaded' : (lesson.uploading ? 'Uploading...' : 'Upload Video') }}
                      </button>

                      @if (lesson.uploading) {
                        <div style="margin-top: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 4px; height: 6px; overflow: hidden;">
                          <div style="background: var(--primary); height: 100%; transition: width 0.2s;" [style.width.%]="lesson.uploadProgress"></div>
                        </div>
                        <p class="page-copy" style="font-size: 0.8rem; margin-top: 0.2rem; text-align: right;">{{ lesson.uploadProgress }}%</p>
                      }
                      
                      @if (lesson.contentUrl && !lesson.uploading) {
                        <p class="page-copy" style="font-size: 0.8rem; margin-top: 0.5rem; color: #a5d6a7;">Video ready.</p>
                      }
                    } @else if (lesson.contentType === 'VIDEO_URL') {
                      <input type="text" class="el-input" [(ngModel)]="lesson.contentUrl" placeholder="YouTube or Vimeo URL" />
                    } @else if (lesson.contentType === 'PDF') {
                      <input type="file" accept=".pdf,application/pdf" (change)="onFileSelected($event, lesson)" style="margin-bottom: 1rem; display: block; color: #fff;" />
                      
                      @if (lesson.selectedFile) {
                        <p class="page-copy" style="font-size: 0.8rem; margin-bottom: 0.5rem;">
                          Selected: {{ lesson.selectedFile.name }} ({{ (lesson.selectedFile.size / 1024 / 1024).toFixed(2) }} MB)
                        </p>
                      }

                      <button class="el-btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;" 
                              (click)="uploadPdf(lesson)" 
                              [disabled]="!lesson.selectedFile || lesson.uploading || lesson.uploaded">
                        {{ lesson.uploaded ? 'Uploaded' : (lesson.uploading ? 'Uploading...' : 'Upload PDF') }}
                      </button>

                      @if (lesson.contentUrl && !lesson.uploading) {
                        <p class="page-copy" style="font-size: 0.8rem; margin-top: 0.5rem; color: #a5d6a7;">PDF ready.</p>
                      }

                      <p class="page-copy" style="font-size: 0.75rem; margin-top: 0.5rem; opacity: 0.6;">Or enter a URL directly:</p>
                      <input type="text" class="el-input" [(ngModel)]="lesson.contentUrl" placeholder="PDF URL (if not uploading)" />
                    } @else {
                      <input type="text" class="el-input" [(ngModel)]="lesson.contentUrl" placeholder="Content URL" />
                    }
                  </div>

                  @if (lesson.errorMsg) {
                    <p class="page-copy" style="color: #e05c5c; font-size: 0.8rem;">{{ lesson.errorMsg }}</p>
                  }

                  <div style="display: flex; justify-content: flex-end;">
                    <button class="btn-secondary" (click)="saveLesson(lesson, $index)">
                      {{ lesson.id ? 'Update Lesson' : 'Save Lesson' }}
                    </button>
                  </div>
                </div>
              }
            </div>

            <div style="display: flex; gap: 1rem;">
              <button class="btn-secondary" (click)="addLessonDraft()">+ Add Lesson</button>
              @if (lessons().length > 0) {
                <button class="el-btn" (click)="saveAllLessons()">Save All Lessons</button>
              }
            </div>
          </article>
        }
        </div>

        <!-- Sidebar Checklist -->
        <div>
          <article class="glass-card" style="padding: 1.5rem; border-radius: 16px; position: sticky; top: 1rem;">
            <h3 class="section-title" style="font-size: 1.1rem; margin-bottom: 1rem;">Checklist</h3>
            <ul style="list-style: none; padding: 0; margin: 0; display: grid; gap: 0.8rem;">
              <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;" class="page-copy">
                <span [style.color]="checklistTitle() ? '#6aaa6a' : 'inherit'">{{ checklistTitle() ? '✓' : '✗' }}</span>
                <span>Course title</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;" class="page-copy">
                <span [style.color]="checklistDesc() ? '#6aaa6a' : 'inherit'">{{ checklistDesc() ? '✓' : '✗' }}</span>
                <span>Description</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;" class="page-copy">
                <span [style.color]="checklistLessons() ? '#6aaa6a' : 'inherit'">{{ checklistLessons() ? '✓' : '✗' }}</span>
                <span>At least one lesson saved</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;" class="page-copy">
                <span [style.color]="checklistPublished() ? '#6aaa6a' : 'inherit'">{{ checklistPublished() ? '✓' : '✗' }}</span>
                <span>Published/Pending</span>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: `
    @media (max-width: 900px) {
      div[style*="grid-template-columns: 1fr 300px"] {
        grid-template-columns: 1fr !important;
      }
    }
  `
})
export class InstructorCreateCourseComponent implements OnInit {
  protected isEditMode = signal(false);
  protected savedCourseId = signal<number | null>(null);
  protected isPublished = signal(false);
  
  protected saving = signal(false);
  protected successMsg = signal('');
  protected errorMsg = signal('');

  protected courseForm = {
    title: signal(''),
    category: signal('Development'),
    level: signal('Beginner'),
    price: signal(0),
    totalDuration: signal(0),
    language: signal('English'),
    description: signal(''),
    thumbnailUrl: signal('')
  };

  protected lessons = signal<LessonDraft[]>([]);

  // Checklist computed properties
  protected checklistTitle = computed(() => this.courseForm.title().trim().length > 0);
  protected checklistDesc = computed(() => this.courseForm.description().trim().length > 0);
  protected checklistLessons = computed(() => this.lessons().some(l => l.id != null));
  protected checklistPublished = computed(() => this.isPublished());

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const courseId = this.route.snapshot.queryParamMap.get('courseId');
    if (courseId) {
      this.isEditMode.set(true);
      this.savedCourseId.set(Number(courseId));
      this.loadCourse(Number(courseId));
    }
  }

  private loadCourse(courseId: number) {
    this.api.getCourseById(courseId).subscribe({
      next: (res: any) => {
        const c = res.data || res;
        this.courseForm.title.set(c.title || '');
        this.courseForm.category.set(c.category || 'Development');
        this.courseForm.level.set(c.level || 'Beginner');
        this.courseForm.price.set(c.price || 0);
        this.courseForm.totalDuration.set(c.totalDuration || 0);
        this.courseForm.language.set(c.language || 'English');
        this.courseForm.description.set(c.description || '');
        this.courseForm.thumbnailUrl.set(c.thumbnailUrl || '');
        
        this.isPublished.set((c.approvalStatus || '') === 'PENDING_APPROVAL' || c.published || c.isPublished || false);
        this.loadLessons(courseId);
      },
      error: () => this.errorMsg.set('Failed to load course details.')
    });
  }

  private loadLessons(courseId: number) {
    this.api.getLessonsByCourse(courseId).subscribe({
      next: (res: any) => {
        const ls = res.data || res || [];
        this.lessons.set(ls.map((l: any) => ({
          id: l.lessonId || l.id,
          title: l.title || '',
          contentType: l.contentType || 'VIDEO',
          contentUrl: l.contentUrl || l.videoUrl || '',
          durationMinutes: l.durationMinutes || 0,
          description: l.description || '',
          isPreview: l.isPreview || false,
          orderIndex: l.orderIndex || 0,
          uploading: false,
          uploadProgress: 0,
          selectedFile: null,
          uploaded: true,
          errorMsg: ''
        })));
      }
    });
  }

  protected saveDraft() {
    if (!this.checklistTitle()) {
      this.errorMsg.set('Course title is required.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    const instructorId = this.auth.userId();
    const payload = {
      title: this.courseForm.title(),
      category: this.courseForm.category(),
      level: this.courseForm.level(),
      price: this.courseForm.price(),
      totalDuration: this.courseForm.totalDuration(),
      language: this.courseForm.language(),
      description: this.courseForm.description(),
      thumbnailUrl: this.courseForm.thumbnailUrl(),
      instructorId: instructorId,
      published: this.isPublished()
    };

    if (this.savedCourseId()) {
      this.api.updateCourse(this.savedCourseId()!, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.successMsg.set('Course updated successfully.');
          setTimeout(() => this.successMsg.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.errorMsg.set('Failed to update course.');
        }
      });
    } else {
      this.api.createCourse(payload).subscribe({
        next: (res: any) => {
          console.log('Course Create Response:', res);
          const id = res.data?.courseId || res.data?.id || res.courseId || res.id;
          
          if (id) {
            this.savedCourseId.set(id);
            this.successMsg.set('Course draft created successfully.');
          } else {
            console.warn('Course created but no ID was found in response! Response keys:', Object.keys(res));
            this.successMsg.set('Course created (ID pending). Refresh recommended.');
          }
          
          this.saving.set(false);
          setTimeout(() => this.successMsg.set(''), 3000);
        },
        error: (err) => {
          console.error('Course Create Error:', err);
          this.saving.set(false);
          this.errorMsg.set('Failed to create course. ' + (err.error?.message || 'Check console.'));
        }
      });
    }
  }

  protected publishCourse() {
    const id = this.savedCourseId();
    if (!id) return;

    this.saving.set(true);
    this.errorMsg.set('');

    this.api.publishCourse(id).subscribe({
      next: () => {
        this.isPublished.set(true);
        this.saving.set(false);
        this.successMsg.set('Course submitted for approval.');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => {
        this.saving.set(false);
        this.errorMsg.set('Failed to publish course.');
      }
    });
  }

  protected addLessonDraft() {
    this.lessons.update(ls => [
      ...ls,
      {
        title: '',
        contentType: 'VIDEO',
        contentUrl: '',
        durationMinutes: 0,
        description: '',
        isPreview: false,
        orderIndex: ls.length + 1,
        uploading: false,
        uploadProgress: 0,
        selectedFile: null,
        uploaded: false,
        errorMsg: ''
      }
    ]);
  }

  protected onFileSelected(event: any, lesson: LessonDraft) {
    const file = event.target.files[0];
    if (file) {
      lesson.selectedFile = file;
      lesson.uploaded = false;
      lesson.contentUrl = '';
    }
  }

  protected uploadVideo(lesson: LessonDraft) {
    const file = lesson.selectedFile;
    const courseId = this.savedCourseId();
    if (!file || !courseId) return;

    lesson.uploading = true;
    lesson.errorMsg = '';
    lesson.uploadProgress = 10;

    this.api.uploadLessonVideo(file, courseId).subscribe({
      next: (response: any) => {
        lesson.uploading = false;
        lesson.uploadProgress = 100;
        lesson.contentUrl = response.data?.fileUrl || response.fileUrl || response.url || 'upload_success';
        lesson.uploaded = true;
      },
      error: () => {
        lesson.uploading = false;
        lesson.uploadProgress = 0;
        lesson.errorMsg = 'Upload failed. Please try again.';
      }
    });
  }

  protected uploadPdf(lesson: LessonDraft) {
    const file = lesson.selectedFile;
    const courseId = this.savedCourseId();
    if (!file || !courseId) return;

    lesson.uploading = true;
    lesson.errorMsg = '';
    lesson.uploadProgress = 10;

    this.api.uploadLessonPdf(file, courseId).subscribe({
      next: (response: any) => {
        lesson.uploading = false;
        lesson.uploadProgress = 100;
        lesson.contentUrl = response.data?.fileUrl || response.fileUrl || response.url || 'upload_success';
        lesson.uploaded = true;
      },
      error: () => {
        lesson.uploading = false;
        lesson.uploadProgress = 0;
        lesson.errorMsg = 'PDF upload failed. Please try again.';
      }
    });
  }

  protected saveLesson(lesson: LessonDraft, index: number) {
    const courseId = this.savedCourseId();
    if (!courseId) return;

    if (!lesson.title) {
      lesson.errorMsg = 'Title is required';
      return;
    }

    lesson.errorMsg = '';

    const payload = {
      courseId: courseId,
      title: lesson.title,
      contentType: lesson.contentType,
      contentUrl: lesson.contentUrl || lesson.selectedFile?.name || '',
      durationMinutes: lesson.durationMinutes,
      description: lesson.description,
      isPreview: lesson.isPreview,
      orderIndex: lesson.orderIndex || index + 1
    };

    if (lesson.id) {
      // Update existing lesson
      this.api.updateLesson(lesson.id, payload).subscribe({
        next: () => {},
        error: () => { lesson.errorMsg = 'Failed to update lesson'; }
      });
    } else {
      // Add new lesson
      this.api.addLesson(payload).subscribe({
        next: (res: any) => {
          const lId = res.data?.lessonId || res.data?.id || res.lessonId || res.id;
          lesson.id = lId;
        },
        error: () => {
          lesson.errorMsg = 'Failed to save lesson';
        }
      });
    }
  }

  protected saveAllLessons() {
    this.lessons().forEach((lesson, index) => {
      if (!lesson.id) {
        this.saveLesson(lesson, index);
      }
    });
  }
}

