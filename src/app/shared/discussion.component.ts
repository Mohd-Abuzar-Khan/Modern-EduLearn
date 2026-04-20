import { Component, OnInit, signal, inject, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-discussion',
  imports: [FormsModule, DatePipe],
  template: `
    <section>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;">
        <div>
          <span class="pill">Community</span>
          <h1 class="page-title" style="font-size:clamp(1.8rem,3.2vw,2.6rem);margin-top:0.75rem;">Discussion</h1>
          <p class="page-copy" style="margin-top:0.35rem;">{{ threads().length }} threads</p>
        </div>
      </div>

      <!-- Course ID input if not set via route -->
      <div style="display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem;">
        <label style="display:flex;align-items:center;gap:0.5rem;">
          <span class="page-copy" style="font-size:0.85rem;">Course ID:</span>
          <input class="el-input" type="number" [(ngModel)]="activeCourseId" style="width:100px;" (change)="loadThreads()" />
        </label>
        <button class="btn-secondary" type="button" (click)="loadThreads()">Load</button>
      </div>

      <!-- New thread form -->
      <article class="glass-card" style="padding:1rem;border-radius:16px;margin-bottom:1rem;">
        <h2 class="section-title" style="font-size:1rem;margin-bottom:0.7rem;">Start a new thread</h2>
        <div style="display:grid;gap:0.6rem;">
          <input class="el-input" type="text" [(ngModel)]="newTitle" placeholder="Thread title…" />
          <textarea class="el-input" rows="3" [(ngModel)]="newBody" placeholder="What's your question or topic?"></textarea>
          <button class="el-btn" type="button" style="width:auto;padding-inline:1rem;" (click)="createThread()" [disabled]="posting()">
            {{ posting() ? 'Posting…' : 'Post Thread' }}
          </button>
        </div>
      </article>

      <!-- Thread list -->
      @if (loading()) {
        <p class="page-copy">Loading threads…</p>
      } @else {
        <div style="display:grid;gap:0.8rem;">
          @for (thread of threads(); track thread.threadId) {
            <article class="glass-card" style="padding:1rem;border-radius:16px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;flex-wrap:wrap;">
                <div style="flex:1;">
                  <h3 class="section-title" style="font-size:1rem;cursor:pointer;" (click)="toggleThread(thread)">
                    {{ thread.title }}
                    <span class="page-copy" style="font-size:0.78rem;margin-left:0.4rem;">
                      {{ thread.status === 'CLOSED' ? '🔒' : '' }}
                      {{ thread.pinned ? '📌' : '' }}
                    </span>
                  </h3>
                  <p class="page-copy" style="margin-top:0.25rem;font-size:0.85rem;">{{ thread.body }}</p>
                  <p class="page-copy" style="font-size:0.75rem;margin-top:0.3rem;opacity:0.6;">by {{ thread.authorName ?? 'User #' + thread.authorId }} · {{ thread.createdAt | date:'mediumDate' }}</p>
                </div>
                <div style="display:flex;flex-direction:column;gap:0.3rem;align-items:flex-end;">
                  @if (canModerate()) {
                    <button class="chip" type="button" style="font-size:0.72rem;" (click)="pinToggle(thread)">{{ thread.pinned ? 'Unpin' : 'Pin' }}</button>
                    <button class="chip" type="button" style="font-size:0.72rem;" (click)="closeToggle(thread)">{{ thread.status === 'CLOSED' ? 'Reopen' : 'Close' }}</button>
                    <button class="chip" type="button" style="font-size:0.72rem;color:#e05c5c;" (click)="deleteThread(thread)">Delete</button>
                  }
                </div>
              </div>

              <!-- Replies -->
              @if (expandedThread() === thread.threadId) {
                <div style="margin-top:0.8rem;padding-top:0.8rem;border-top:1px solid rgba(255,255,255,0.08);">
                  @if (loadingReplies()) {
                    <p class="page-copy" style="font-size:0.82rem;">Loading replies…</p>
                  } @else {
                    <div style="display:grid;gap:0.5rem;margin-bottom:0.7rem;">
                      @for (reply of replies(); track reply.replyId) {
                        <div class="soft-card" style="padding:0.65rem;border-radius:10px;">
                          <div style="display:flex;justify-content:space-between;gap:0.5rem;">
                            <p style="font-size:0.85rem;color:var(--el-text-primary);">{{ reply.body }}</p>
                            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.25rem;flex-shrink:0;">
                              <span class="page-copy" style="font-size:0.72rem;">{{ reply.authorName ?? 'User #' + reply.authorId }}</span>
                              @if (reply.accepted) { <span class="chip" style="font-size:0.68rem;color:#6aaa6a;">✓ Accepted</span> }
                              <div style="display:flex;gap:0.25rem;">
                                <button class="chip" style="font-size:0.68rem;" (click)="upvote(reply)">▲ {{ reply.upvotes ?? 0 }}</button>
                                @if (canModerate() && !reply.accepted) {
                                  <button class="chip" style="font-size:0.68rem;color:#6aaa6a;" (click)="acceptReply(reply)">Accept</button>
                                }
                                @if (canModerate()) {
                                  <button class="chip" style="font-size:0.68rem;color:#e05c5c;" (click)="deleteReply(reply)">Del</button>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                      @if (replies().length === 0) { <p class="page-copy" style="font-size:0.82rem;">No replies yet. Be the first!</p> }
                    </div>
                  }

                  @if (thread.status !== 'CLOSED') {
                    <div style="display:flex;gap:0.5rem;">
                      <input class="el-input" type="text" [(ngModel)]="newReply" placeholder="Write a reply…" style="flex:1;" (keyup.enter)="postReply(thread)" />
                      <button class="el-btn" type="button" style="width:auto;padding-inline:0.8rem;" (click)="postReply(thread)" [disabled]="postingReply()">Send</button>
                    </div>
                  } @else {
                    <p class="page-copy" style="font-size:0.8rem;opacity:0.6;">This thread is closed.</p>
                  }
                </div>
              }
            </article>
          }
          @if (threads().length === 0 && !loading()) {
            <p class="page-copy">No threads yet. Enter a Course ID and start a discussion!</p>
          }
        </div>
      }
    </section>
  `,
})
export class DiscussionComponent implements OnInit {
  protected threads = signal<any[]>([]);
  protected replies = signal<any[]>([]);
  protected loading = signal(false);
  protected loadingReplies = signal(false);
  protected posting = signal(false);
  protected postingReply = signal(false);
  protected expandedThread = signal<number | null>(null);

  protected activeCourseId = 1;
  protected newTitle = '';
  protected newBody = '';
  protected newReply = '';

  private route = inject(ActivatedRoute);
  protected canModerate = signal(false);

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const cid = this.route.snapshot.queryParamMap.get('courseId');
    if (cid) this.activeCourseId = +cid;
    this.canModerate.set(this.auth.isInstructor() || this.auth.isAdmin());
    this.loadThreads();
  }

  protected loadThreads() {
    if (!this.activeCourseId) return;
    this.loading.set(true);
    this.api.getThreadsByCourse(this.activeCourseId).subscribe({
      next: (data: any[]) => { this.threads.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected createThread() {
    if (!this.newTitle.trim()) return;
    this.posting.set(true);
    const uid = this.auth.userId();
    const uname = this.auth.user()?.fullName;
    const payload = { 
      title: this.newTitle, 
      body: this.newBody, 
      courseId: this.activeCourseId, 
      authorId: uid,
      authorName: uname
    };
    this.api.createThread(payload).subscribe({
      next: () => { this.newTitle = ''; this.newBody = ''; this.posting.set(false); this.loadThreads(); },
      error: () => this.posting.set(false),
    });
  }

  protected toggleThread(thread: any) {
    if (this.expandedThread() === thread.threadId) {
      this.expandedThread.set(null);
    } else {
      this.expandedThread.set(thread.threadId);
      this.loadReplies(thread.threadId);
    }
  }

  private loadReplies(threadId: number) {
    this.loadingReplies.set(true);
    this.api.getRepliesByThread(threadId).subscribe({
      next: (data: any[]) => { this.replies.set(data ?? []); this.loadingReplies.set(false); },
      error: () => this.loadingReplies.set(false),
    });
  }

  protected postReply(thread: any) {
    if (!this.newReply.trim()) return;
    this.postingReply.set(true);
    const uid = this.auth.userId();
    const uname = this.auth.user()?.fullName;
    this.api.postReply({ 
      body: this.newReply, // KEY FIX: Match backend entity field 'body' (not content)
      threadId: thread.threadId, 
      authorId: uid,
      authorName: uname
    }).subscribe({
      next: () => { this.newReply = ''; this.postingReply.set(false); this.loadReplies(thread.threadId); },
      error: () => this.postingReply.set(false),
    });
  }

  protected upvote(reply: any) {
    const uid = this.auth.userId();
    if (!uid) return;
    this.api.upvoteReply(reply.replyId, uid).subscribe({ next: () => this.loadReplies(this.expandedThread()!) });
  }

  protected acceptReply(reply: any) {
    this.api.acceptReply(reply.replyId).subscribe({ next: () => this.loadReplies(this.expandedThread()!) });
  }

  protected deleteReply(reply: any) {
    this.api.deleteReply(reply.replyId).subscribe({ next: () => this.loadReplies(this.expandedThread()!) });
  }

  protected pinToggle(thread: any) {
    const req = thread.pinned ? this.api.closeThread(thread.threadId) : this.api.pinThread(thread.threadId);
    req.subscribe({ next: () => this.loadThreads() });
  }

  protected closeToggle(thread: any) {
    const req = thread.status === 'CLOSED' ? this.api.closeThread(thread.threadId) : this.api.closeThread(thread.threadId);
    req.subscribe({ next: () => this.loadThreads() });
  }

  protected deleteThread(thread: any) {
    if (!confirm('Delete this thread?')) return;
    this.api.deleteThread(thread.threadId).subscribe({ next: () => this.loadThreads() });
  }
}
