import { Component, computed, ElementRef, inject, input, model, output } from '@angular/core';
import {
  FormCheckboxControl,
  ValidationError,
  WithOptionalFieldTree,
} from '@angular/forms/signals';

/** Accessible checkbox wrapper for Signal Forms controls. */
@Component({
  selector: 'app-checkbox',
  styleUrl: './app-checkbox.component.css',
  template: `
    <div class="field">
      <span class="label-placeholder" aria-hidden="true">&nbsp;</span>
      <label class="checkbox">
        <input
          type="checkbox"
          [checked]="checked()"
          (change)="checked.set($any($event.target).checked)"
          (blur)="touch.emit()"
          [disabled]="disabled()"
          [attr.aria-invalid]="showError()"
          [attr.aria-describedby]="showError() ? errorId() : null"
          [attr.data-testid]="testId()"
        />
        <span>{{ label() }}</span>
      </label>
      <div class="support">
        @if (showError()) {
          <p class="error" [id]="errorId()" role="alert">{{ errorMessage() }}</p>
        }
      </div>
    </div>
  `,
})
export class AppCheckboxComponent implements FormCheckboxControl {
  private readonly elementRef = inject(ElementRef).nativeElement as HTMLElement;

  /** Text visibly associated with the checkbox. */
  readonly label = input.required<string>();
  /** Checked state managed by the parent Signal Form through the formField directive. */
  readonly checked = model.required<boolean>();
  /** Whether the form prevents changing the checkbox. */
  readonly disabled = input(false);
  /** Whether the form has reported one or more validation errors. */
  readonly invalid = input(false);
  /** Whether the user has moved focus away from the checkbox. */
  readonly touched = input(false);
  /** Whether the checked state differs from the initial form value. */
  readonly dirty = input(false);
  /** Validation errors supplied by the form. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  /** Notifies the form that the native checkbox has lost focus. */
  readonly touch = output();
  /** Stable selector used by automated UI tests. */
  readonly testId = input.required<string>();

  /** Whether validation feedback should be visible to the user. */
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));
  /** Identifier used by the validation feedback. */
  protected readonly errorId = computed(() => `${this.testId()}-error`);
  /** First validation message supplied by the form, with an accessible fallback. */
  protected readonly errorMessage = computed(
    () => this.errors().find((error) => error.message)?.message ?? 'Revisa este campo.',
  );

  /** Focuses the native checkbox used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.elementRef.querySelector('input')?.focus(options);
  }
}
