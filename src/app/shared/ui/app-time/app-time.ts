import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { AppFieldShell } from '../app-field-shell/app-field-shell';
import { injectFieldState } from '../form-field/field-state';

/** Accessible native time input wrapper for Signal Forms controls. */
@Component({
  selector: 'app-time',
  imports: [AppFieldShell],
  styleUrl: './app-time.css',
  template: `
    <app-field-shell [label]="label()" [controlId]="controlId()" [hint]="hint()"
      ><input
        #input
        [id]="controlId()"
        type="time"
        [value]="value()"
        (input)="value.set(input.value)"
        (blur)="touch.emit()"
        [disabled]="fieldDisabled()"
        [readonly]="fieldReadonly()"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="showError()"
        [attr.aria-required]="fieldRequired()"
        [attr.data-testid]="testId()"
    /></app-field-shell>
  `,
})
export class AppTime implements FormValueControl<string> {
  private readonly field = injectFieldState();

  readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  /** Label visibly associated with the native time input. */
  readonly label = input.required<string>();
  /** Identifier shared by label, input and support text. */
  readonly controlId = input.required<string>();
  /** Native HH:mm value managed by the parent Signal Form. */
  readonly value = model.required<string>();
  /** Help text displayed until a validation error is shown. */
  readonly hint = input('');
  /** Earliest accepted time in native HH:mm format. */
  readonly min = input<string | undefined>(undefined);
  /** Latest accepted time in native HH:mm format. */
  readonly max = input<string | undefined>(undefined);
  /** Native time increment in seconds. */
  readonly step = input<number | undefined>(undefined);
  /** Notifies Signal Forms that the native input lost focus. */
  readonly touch = output();
  /** Stable selector used by automated UI tests. */
  readonly testId = input.required<string>();

  protected readonly fieldDisabled = this.field.disabled;
  protected readonly fieldReadonly = this.field.readonly;
  protected readonly fieldRequired = this.field.required;
  protected readonly showError = this.field.showError;
  protected readonly describedBy = computed(() => {
    if (this.showError()) return `${this.controlId()}-error`;
    if (this.hint()) return `${this.controlId()}-hint`;
    return null;
  });

  /** Focuses the native time input used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.input().nativeElement.focus(options);
  }
}
