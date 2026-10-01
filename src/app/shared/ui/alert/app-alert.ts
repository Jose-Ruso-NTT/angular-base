import { Component, computed, input } from '@angular/core';

/**
 *
 */
export type AlertType = 'info' | 'warning' | 'alert';
/**
 *
 */
export type AlertRole = 'status' | 'alert';

/** Reusable accessible message for informational, warning and error states. */
@Component({
  selector: 'app-alert',
  styleUrl: './app-alert.css',
  template: `
    <div
      class="alert"
      [class.info]="type() === 'info'"
      [class.warning]="type() === 'warning'"
      [class.alert-error]="type() === 'alert'"
      [attr.role]="effectiveRole()"
      aria-atomic="true"
    >
      @if (message()) {
        <p>{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class AppAlert {
  /** Visual and semantic severity of the message. */
  readonly type = input.required<AlertType>();
  /**
   * Message announced to assistive technologies. Additional actions can be projected.
   * @default ''
   */
  readonly message = input('');
  /**
   * Overrides the default role: status for info, alert for warning and alert.
   * @default null
   */
  readonly role = input<AlertRole | null>(null);

  protected readonly effectiveRole = computed<AlertRole>(
    () => this.role() ?? (this.type() === 'info' ? 'status' : 'alert'),
  );
}
