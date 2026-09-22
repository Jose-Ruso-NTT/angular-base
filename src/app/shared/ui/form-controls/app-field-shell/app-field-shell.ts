import { Component, input } from '@angular/core';
import { AppFieldMessages } from '../app-field-messages/app-field-messages';
import { injectFieldState } from '../field-state';

/** Shared label and validation-message layout for standard form controls. */
@Component({
  selector: 'app-field-shell',
  imports: [AppFieldMessages],
  styleUrl: './app-field-shell.css',
  template: `
    <div class="field">
      <label [id]="labelId()" [attr.for]="labelFor() === undefined ? controlId() : labelFor()">
        {{ label() }}
        @if (required()) {
          <span aria-hidden="true">*</span>
        }
      </label>
      <ng-content />
      <app-field-messages [controlId]="controlId()" [hint]="hint()" />
    </div>
  `,
})
export class AppFieldShell {
  private readonly field = injectFieldState();

  /** Text visibly associated with the native control. */
  readonly label = input.required<string>();
  /** Identifier shared by label, control and support text. */
  readonly controlId = input.required<string>();
  /**
   * Native control associated with the label. Use `null` for ARIA widgets,
   * which are labelled through `aria-labelledby` instead.
   */
  readonly labelFor = input<string | null>();
  /** Help text displayed until validation feedback is shown. */
  readonly hint = input('');

  /** Identifier exposed so ARIA widgets can reference the visible label. */
  protected readonly labelId = () => `${this.controlId()}-label`;

  protected readonly required = this.field.required;
}
