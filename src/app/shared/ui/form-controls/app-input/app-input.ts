import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { AppFieldShell } from '../app-field-shell/app-field-shell';
import { injectFieldState } from '../field-state';

type TextInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

/** Accessible text-like native input wrapper for Signal Forms controls. */
@Component({
  selector: 'app-input',
  imports: [AppFieldShell],
  styleUrl: './app-input.css',
  template: `
    <app-field-shell [label]="label()" [controlId]="controlId()" [hint]="hint()">
      <input
        #input
        [id]="controlId()"
        [type]="type()"
        [value]="value()"
        (input)="value.set(input.value)"
        (blur)="touch.emit()"
        [disabled]="fieldDisabled()"
        [readonly]="fieldReadonly()"
        [attr.autocomplete]="autocomplete()"
        [attr.placeholder]="placeholder() || null"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="showError()"
        [attr.aria-required]="fieldRequired()"
        [attr.data-testid]="testId()"
      />
    </app-field-shell>
  `,
})
export class AppInput implements FormValueControl<string> {
  private readonly field = injectFieldState();

  readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  /** Label visibly associated with the native input. */
  readonly label = input.required<string>();
  /** Identifier shared by label, input and support text. */
  readonly controlId = input.required<string>();
  /** Value managed by the parent Signal Form through the formField directive. */
  readonly value = model.required<string>();
  /** Native text input type. Defaults to text. */
  readonly type = input<TextInputType>('text');
  /** Help text displayed until a validation error is shown. */
  readonly hint = input('');
  /** Expected browser autofill token. */
  readonly autocomplete = input('off');
  /** Text shown when the field has no value. */
  readonly placeholder = input('');
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

  /** Focuses the native input used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.input().nativeElement.focus(options);
  }
}
