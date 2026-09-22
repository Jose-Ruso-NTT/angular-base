import { Component, input } from '@angular/core';
import { AppFieldMessages } from '../app-field-messages/app-field-messages';
import { injectFieldState } from '../form-field/field-state';

/** Shared label and validation-message layout for standard form controls. */
@Component({
  selector: 'app-field-shell',
  imports: [AppFieldMessages],
  styleUrl: './app-field-shell.css',
  template: `
    <div class="field">
      <label [for]="controlId()">
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
  /** Help text displayed until validation feedback is shown. */
  readonly hint = input('');

  protected readonly required = this.field.required;
}
