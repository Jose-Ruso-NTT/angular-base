import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { AppFieldMessages } from '../app-field-messages/app-field-messages';
import { injectFieldState } from '../form-field/field-state';

/** Accessible checkbox wrapper for Signal Forms controls. */
@Component({
  selector: 'app-checkbox',
  imports: [AppFieldMessages],
  styleUrl: './app-checkbox.css',
  template: `
    <div class="field">
      <label class="checkbox" [for]="controlId()">
        <input
          #input
          [id]="controlId()"
          type="checkbox"
          [checked]="checked()"
          (change)="checked.set(input.checked)"
          (blur)="touch.emit()"
          [disabled]="fieldDisabled()"
          [attr.aria-invalid]="showError()"
          [attr.aria-describedby]="describedBy()"
          [attr.data-testid]="testId()"
        />
        <span>{{ label() }}</span>
      </label>
      <app-field-messages [controlId]="controlId()" [hint]="hint()" />
    </div>
  `,
})
export class AppCheckbox implements FormCheckboxControl {
  private readonly field = injectFieldState();

  readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  /** Text visibly associated with the checkbox. */
  readonly label = input.required<string>();
  /** Identifier shared by checkbox and support text. */
  readonly controlId = input.required<string>();
  /** Checked state managed by the parent Signal Form. */
  readonly checked = model.required<boolean>();
  /** Help text displayed until a validation error is shown. */
  readonly hint = input('');
  /** Notifies Signal Forms that the checkbox lost focus. */
  readonly touch = output();
  /** Stable selector used by automated UI tests. */
  readonly testId = input.required<string>();

  protected readonly fieldDisabled = this.field.disabled;
  protected readonly showError = this.field.showError;
  protected readonly describedBy = computed(() => {
    if (this.showError()) return `${this.controlId()}-error`;
    if (this.hint()) return `${this.controlId()}-hint`;
    return null;
  });

  /** Focuses the native checkbox used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.input().nativeElement.focus(options);
  }
}
