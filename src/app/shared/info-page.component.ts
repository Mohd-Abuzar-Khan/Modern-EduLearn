import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="content-wrap page-shell">
      <div class="glass-card" style="border-radius: 28px; padding: 2rem; max-width: 920px; margin: 0 auto;">
        <span class="pill">{{ title }}</span>
        <h1 class="page-title" style="margin-top: 1rem;">{{ title }}</h1>
        <p class="page-copy" style="max-width: 64ch; margin-top: 1rem;">{{ description }}</p>
      </div>
    </section>
  `,
})
export class InfoPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = this.route.snapshot.data['title'] ?? 'Page';
  protected readonly description = this.route.snapshot.data['description'] ?? 'Content is being migrated into Angular.';
}
