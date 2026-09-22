import { Component, input } from '@angular/core';

/** Semantic appearance options for a status badge. */
export type StatusBadgeTone = 'success' | 'neutral' | 'warning' | 'danger' | 'info';

/** Reusable compact label for displaying a state or classification. */
@Component({
  selector: 'app-status-badge',
  styleUrl: './app-status-badge.css',
  template: `<span class="status-badge" [class]="'status-badge ' + tone()">{{ label() }}</span>`,
})
export class AppStatusBadge {
  /** Text shown in the badge. */
  readonly label = input.required<string>();
  /** Semantic color applied to the badge. */
  readonly tone = input.required<StatusBadgeTone>();
}
