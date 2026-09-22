import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { AppFieldShell } from '../app-field-shell/app-field-shell';
import { injectFieldState } from '../form-field/field-state';

/** Primitive values supported by native single-choice controls. */
export type SelectValue = string | number;

/** A selectable value rendered by the native select controls. */
export interface SelectOption<T extends SelectValue = string> {
  /** Value stored in the form control. */
  readonly value: T;
  /** User-facing option text. */
  readonly label: string;
  /** Prevents selecting this option while keeping it visible. */
  readonly disabled?: boolean;
}

/** Accessible native select wrapper for Signal Forms controls. */
@Component({
  selector: 'app-select',
  imports: [AppFieldShell],
  styleUrl: './app-select.css',
  template: `
    <app-field-shell [label]="label()" [controlId]="controlId()" [hint]="hint()"
      ><select
        #select
        [id]="controlId()"
        (change)="setSelected(select)"
        (blur)="touch.emit()"
        [disabled]="fieldDisabled()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="showError()"
        [attr.aria-required]="fieldRequired()"
        [attr.data-testid]="testId()"
      >
        @for (option of options(); track option.value) {
          <option
            [value]="optionValue(option.value)"
            [selected]="option.value === value()"
            [disabled]="option.disabled ?? false"
          >
            {{ option.label }}
          </option>
        }
      </select></app-field-shell
    >
  `,
})
export class AppSelect<T extends SelectValue = string> implements FormValueControl<T> {
  private readonly field = injectFieldState();

  readonly select = viewChild.required<ElementRef<HTMLSelectElement>>('select');

  /** Label visibly associated with the native select. */
  readonly label = input.required<string>();
  /** Identifier shared by label, select and support text. */
  readonly controlId = input.required<string>();
  /** Value managed by the parent Signal Form. */
  readonly value = model.required<T>();
  /** Values available to select. */
  readonly options = input.required<readonly SelectOption<T>[]>();
  /** Help text displayed until a validation error is shown. */
  readonly hint = input('');
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

  /** Updates the model with the typed option value selected in the native control. */
  protected setSelected(select: HTMLSelectElement): void {
    const option = this.options().at(select.selectedIndex);
    if (option !== undefined) this.value.set(option.value);
  }

  /** Converts a typed option value to the string required by native option elements. */
  protected optionValue(value: SelectValue): string {
    return String(value);
  }

  /** Focuses the native select used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.select().nativeElement.focus(options);
  }
}
