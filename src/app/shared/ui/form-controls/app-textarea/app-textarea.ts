import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { AppFieldShell } from '../app-field-shell/app-field-shell';
import { injectFieldState } from '../field-state';

/** Accessible native textarea wrapper for Signal Forms controls. */
@Component({
  selector: 'app-textarea',
  imports: [AppFieldShell],
  styleUrl: './app-textarea.css',
  template: `
    <app-field-shell [label]="label()" [controlId]="controlId()" [hint]="hint()">
      <textarea
        #textarea
        [id]="controlId()"
        [value]="value()"
        (input)="value.set(textarea.value)"
        (blur)="touch.emit()"
        [disabled]="fieldDisabled()"
        [readonly]="fieldReadonly()"
        [rows]="rows()"
        [attr.placeholder]="placeholder() || null"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="showError()"
        [attr.aria-required]="fieldRequired()"
        [attr.data-testid]="testId()"
      ></textarea>
    </app-field-shell>
  `,
})
export class AppTextarea implements FormValueControl<string> {
  private readonly field = injectFieldState();

  readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');

  /** Label visibly associated with the textarea. */
  readonly label = input.required<string>();
  /** Identifier shared by label, textarea and support text. */
  readonly controlId = input.required<string>();
  /** Text value managed by the parent Signal Form. */
  readonly value = model.required<string>();
  /** Help text displayed until a validation error is shown. */
  readonly hint = input('');
  /** Number of visible text rows. */
  readonly rows = input(3);
  /** Text shown when the field has no value. */
  readonly placeholder = input('');
  /** Notifies Signal Forms that the textarea lost focus. */
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

  /** Focuses the native textarea used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.textarea().nativeElement.focus(options);
  }
}
