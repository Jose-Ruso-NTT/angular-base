import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { type SelectValue } from '../app-select/app-select';
import { AppFieldMessages } from '../app-field-messages/app-field-messages';
import { injectFieldState } from '../form-field/field-state';

/** A selectable value rendered by AppRadioGroup. */
export interface RadioOption<T extends SelectValue = string> {
  /** Value stored in the form control. */
  readonly value: T;
  /** User-facing option text. */
  readonly label: string;
}

/** Accessible native radio-group wrapper for Signal Forms controls. */
@Component({
  selector: 'app-radio-group',
  imports: [AppFieldMessages],
  styleUrl: './app-radio-group.css',
  template: `
    <div class="field">
      <fieldset
        #group
        [disabled]="fieldDisabled()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="showError()"
        [attr.aria-required]="fieldRequired()"
        [attr.data-testid]="testId()"
      >
        <legend [id]="legendId()">
          {{ label() }}
          @if (fieldRequired()) {
            <span aria-hidden="true">*</span>
          }
        </legend>
        <div class="options">
          @for (option of options(); track option.value; let index = $index) {
            <label [for]="optionId(index)">
              <input
                type="radio"
                [id]="optionId(index)"
                [name]="controlId()"
                [value]="optionValue(option.value)"
                [checked]="option.value === value()"
                (change)="value.set(option.value)"
                (blur)="touch.emit()"
              />
              <span>{{ option.label }}</span>
            </label>
          }
        </div>
      </fieldset>
      <app-field-messages [controlId]="controlId()" [hint]="hint()" />
    </div>
  `,
})
export class AppRadioGroup<T extends SelectValue = string> implements FormValueControl<T> {
  private readonly field = injectFieldState();

  readonly group = viewChild.required<ElementRef<HTMLFieldSetElement>>('group');

  /** Text that labels the radio group. */
  readonly label = input.required<string>();
  /** Identifier used to group radio inputs and associate validation feedback. */
  readonly controlId = input.required<string>();
  /** Selected value managed by the parent Signal Form. */
  readonly value = model.required<T>();
  /** Values available for selection. */
  readonly options = input.required<readonly RadioOption<T>[]>();
  /** Help text displayed until a validation error is shown. */
  readonly hint = input('');
  /** Notifies Signal Forms that focus left a radio option. */
  readonly touch = output();
  /** Stable selector used by automated UI tests. */
  readonly testId = input.required<string>();

  protected readonly fieldDisabled = this.field.disabled;
  protected readonly fieldRequired = this.field.required;
  protected readonly showError = this.field.showError;
  protected readonly legendId = computed(() => `${this.controlId()}-legend`);
  protected readonly describedBy = computed(() => {
    if (this.showError()) return `${this.controlId()}-error`;
    if (this.hint()) return `${this.controlId()}-hint`;
    return null;
  });

  /** Produces a stable unique ID for an option in this group. */
  protected optionId(index: number): string {
    return `${this.controlId()}-option-${String(index)}`;
  }

  /** Converts a typed option value to the string required by native radio inputs. */
  protected optionValue(value: SelectValue): string {
    return String(value);
  }

  /** Focuses the selected radio option, or the first option when no value is selected. */
  focus(options?: FocusOptions): void {
    this.group()
      .nativeElement.querySelector<HTMLInputElement>('input:checked, input')
      ?.focus(options);
  }
}
