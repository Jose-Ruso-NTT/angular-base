import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { type SelectOption } from '../app-select/app-select';
import { AppFieldShell } from '../app-field-shell/app-field-shell';
import { injectFieldState } from '../form-field/field-state';

/** Accessible native multi-select wrapper for Signal Forms controls. */
@Component({
  selector: 'app-multiselect',
  imports: [AppFieldShell],
  styleUrl: './app-multiselect.css',
  template: `
    <app-field-shell [label]="label()" [controlId]="controlId()" [hint]="hint()"
      ><select
        #select
        [id]="controlId()"
        multiple
        [size]="size()"
        (change)="setSelected(select)"
        (blur)="touch.emit()"
        [disabled]="fieldDisabled()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="showError()"
        [attr.aria-required]="fieldRequired()"
        [attr.data-testid]="testId()"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value" [selected]="value().includes(option.value)">
            {{ option.label }}
          </option>
        }
      </select></app-field-shell
    >
  `,
})
export class AppMultiselect implements FormValueControl<string[]> {
  private readonly field = injectFieldState();

  readonly select = viewChild.required<ElementRef<HTMLSelectElement>>('select');

  /** Label visibly associated with the native multi-select. */
  readonly label = input.required<string>();
  /** Identifier shared by label, select and support text. */
  readonly controlId = input.required<string>();
  /** Selected values managed by the parent Signal Form. */
  readonly value = model.required<string[]>();
  /** Values available to select. */
  readonly options = input.required<readonly SelectOption[]>();
  /** Help text displayed until a validation error is shown. */
  readonly hint = input('');
  /** Number of options displayed without scrolling. */
  readonly size = input(4);
  /** Notifies Signal Forms that the select lost focus. */
  readonly touch = output();
  /** Stable selector used by automated UI tests. */
  readonly testId = input.required<string>();

  protected readonly fieldDisabled = this.field.disabled;
  protected readonly fieldRequired = this.field.required;
  protected readonly showError = this.field.showError;
  protected readonly describedBy = computed(() => {
    if (this.showError()) return `${this.controlId()}-error`;
    if (this.hint()) return `${this.controlId()}-hint`;
    return null;
  });

  protected setSelected(select: HTMLSelectElement): void {
    this.value.set(Array.from(select.selectedOptions, (option) => option.value));
  }

  /** Focuses the native multi-select used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.select().nativeElement.focus(options);
  }
}
