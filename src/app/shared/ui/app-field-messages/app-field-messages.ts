import { Component, computed, input } from '@angular/core';
import { injectFieldState } from '../form-field/field-state';

/** Renders help text and validation feedback for a Signal Forms control. */
@Component({
  selector: 'app-field-messages',
  styleUrl: './app-field-messages.css',
  template: `
    <div class="support">
      @if (showError()) {
        <p class="error" [id]="errorId()" role="alert">{{ errorMessage() }}</p>
      } @else if (hint()) {
        <p class="hint" [id]="hintId()">{{ hint() }}</p>
      }
    </div>
  `,
})
export class AppFieldMessages {
  private readonly field = injectFieldState();

  /** Identifier of the related native control. */
  readonly controlId = input.required<string>();
  /** Help text displayed until validation feedback is shown. */
  readonly hint = input('');

  protected readonly showError = this.field.showError;
  protected readonly hintId = computed(() => `${this.controlId()}-hint`);
  protected readonly errorId = computed(() => `${this.controlId()}-error`);
  protected readonly errorMessage = computed(
    () => this.field.state()?.errors()[0]?.message ?? 'Revisa este campo.',
  );
}
