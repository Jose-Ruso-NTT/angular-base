import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { AppFieldShell } from '../app-field-shell/app-field-shell';
import { injectFieldState } from '../form-field/field-state';

/** Accessible native number input wrapper for Signal Forms controls. */
@Component({
  selector: 'app-number',
  imports: [AppFieldShell],
  styleUrl: './app-number.css',
  template: `
    <app-field-shell [label]="label()" [controlId]="controlId()" [hint]="hint()">
      <input
        #input
        [id]="controlId()"
        type="number"
        [value]="value() ?? ''"
        (input)="setNativeValue(input.valueAsNumber)"
        (blur)="touch.emit()"
        [disabled]="fieldDisabled()"
        [readonly]="fieldReadonly()"
        [attr.placeholder]="placeholder() || null"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="showError()"
        [attr.aria-required]="fieldRequired()"
        [attr.data-testid]="testId()"
      />
    </app-field-shell>
  `,
})
export class AppNumber implements FormValueControl<number | null> {
  private readonly field = injectFieldState();

  readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  /** Label visibly associated with the native number input. */
  readonly label = input.required<string>();
  /** Identifier shared by label, input and support text. */
  readonly controlId = input.required<string>();
  /** Numeric value managed by the parent Signal Form. */
  readonly value = model.required<number | null>();
  /** Help text displayed until a validation error is shown. */
  readonly hint = input('');
  /** Text shown when the field has no value. */
  readonly placeholder = input('');
  /** Minimum native value. */
  readonly min = input<number | undefined>(undefined);
  /** Maximum native value. */
  readonly max = input<number | undefined>(undefined);
  /** Native number increment. */
  readonly step = input<number | 'any' | undefined>(undefined);
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

  /** Updates the form with a native numeric value, treating an empty value as null. */
  protected setNativeValue(nativeValue: number): void {
    this.value.set(Number.isNaN(nativeValue) ? null : nativeValue);
  }

  /** Focuses the native number input used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.input().nativeElement.focus(options);
  }
}
