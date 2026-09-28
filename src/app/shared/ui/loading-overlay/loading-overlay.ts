import { Component, input } from '@angular/core';

/** Places a loading layer above projected content without changing its layout. */
@Component({
  selector: 'app-loading-overlay',
  styleUrl: './loading-overlay.css',
  template: `
    <div class="overlay-host" [attr.aria-busy]="loading() ? 'true' : 'false'">
      <ng-content />
      @if (loading()) {
        <div class="overlay" role="status" aria-live="polite">
          <span class="spinner" aria-hidden="true"></span>
          <span>{{ message() }}</span>
        </div>
      }
    </div>
  `,
})
export class LoadingOverlay {
  /** Whether the overlay should be visible. */
  readonly loading = input.required();
  /** Accessible text announced while the projected content is loading. */
  readonly message = input('Cargando…');
}
