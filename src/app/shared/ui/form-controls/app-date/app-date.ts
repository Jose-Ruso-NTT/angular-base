import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { AppFieldShell } from '../app-field-shell/app-field-shell';
import { injectFieldState } from '../field-state';

/** ISO calendar date represented without a time or timezone (`YYYY-MM-DD`). */
export type LocalDate = `${number}-${number}-${number}`;

/** Accessible native date input wrapper for Signal Forms controls. */
@Component({
  selector: 'app-date',
  imports: [AppFieldShell],
  styleUrl: './app-date.css',
  template: `
    <app-field-shell [label]="label()" [controlId]="controlId()" [hint]="hint()">
      <input
        #input
        [id]="controlId()"
        type="date"
        [value]="value()"
        (input)="setNativeValue(input.value)"
        (blur)="touch.emit()"
        [disabled]="fieldDisabled()"
        [readonly]="fieldReadonly()"
        [attr.min]="nativeMin()"
        [attr.max]="nativeMax()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="showError()"
        [attr.aria-required]="fieldRequired()"
        [attr.data-testid]="testId()"
      />
    </app-field-shell>
  `,
})
export class AppDate implements FormValueControl<LocalDate | null> {
  private readonly field = injectFieldState();

  readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  /** Label visibly associated with the native date input. */
  readonly label = input.required<string>();
  /** Identifier shared by label, input and support text. */
  readonly controlId = input.required<string>();
  /** Calendar date managed by the parent Signal Form without timezone conversion. */
  readonly value = model.required<LocalDate | null>();
  /** Help text displayed until a validation error is shown. */
  readonly hint = input('');
  /** Minimum accepted calendar date in `YYYY-MM-DD` format. */
  readonly min = input<LocalDate | undefined>(undefined);
  /** Maximum accepted calendar date in `YYYY-MM-DD` format. */
  readonly max = input<LocalDate | undefined>(undefined);
  /** Notifies Signal Forms that the native input lost focus. */
  readonly touch = output();
  /** Stable selector used by automated UI tests. */
  readonly testId = input.required<string>();

  protected readonly fieldDisabled = this.field.disabled;
  protected readonly fieldReadonly = this.field.readonly;
  protected readonly fieldRequired = this.field.required;
  protected readonly showError = this.field.showError;
  protected readonly nativeMin = computed(() => this.min());
  protected readonly nativeMax = computed(() => this.max());
  protected readonly describedBy = computed(() => {
    if (this.showError()) return `${this.controlId()}-error`;
    if (this.hint()) return `${this.controlId()}-hint`;
    return null;
  });

  /** Synchronizes a native date string without creating a timezone-aware Date instance. */
  protected setNativeValue(value: string): void {
    this.value.set(value === '' ? null : (value as LocalDate));
  }

  /** Focuses the native date input used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.input().nativeElement.focus(options);
  }
}
