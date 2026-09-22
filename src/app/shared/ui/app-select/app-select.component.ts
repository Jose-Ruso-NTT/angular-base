import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

/** A selectable value rendered by AppSelectComponent. */
export interface SelectOption {
  /** Value stored in the form control. */
  readonly value: string;
  /** User-facing option text. */
  readonly label: string;
}

/** Accessible select wrapper for Signal Forms controls. */
@Component({
  selector: 'app-select',
  styleUrl: './app-select.component.css',
  template: `
    <div class="field">
      <label [for]="selectId()"
        >{{ label() }}
        @if (required()) {
          <span aria-hidden="true">*</span>
        }
      </label>
      <select
        #select
        [id]="selectId()"
        [value]="value()"
        (change)="value.set($any($event.target).value)"
        (blur)="touch.emit()"
        [disabled]="disabled()"
        [attr.aria-invalid]="showError()"
        [attr.aria-describedby]="showError() ? errorId() : null"
        [attr.data-testid]="testId()"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
      <div class="support">
        @if (showError()) {
          <p class="error" [id]="errorId()" role="alert">{{ errorMessage() }}</p>
        }
      </div>
    </div>
  `,
})
export class AppSelectComponent implements FormValueControl<string> {
  readonly select = viewChild.required<ElementRef<HTMLInputElement>>('select');

  /** Label visibly associated with the native select. */
  readonly label = input.required<string>();
  /** Value managed by the parent Signal Form through the formField directive. */
  readonly value = model.required<string>();
  /** Values available to select. */
  readonly options = input.required<readonly SelectOption[]>();
  /** Identifier shared by label, select and error text. */
  readonly selectId = input.required<string>();
  /** Validation and interaction state provided by the formField directive. */
  readonly required = input(false);
  /** Whether the form prevents editing the control. */
  readonly disabled = input(false);
  /** Whether the form has reported one or more validation errors. */
  readonly invalid = input(false);
  /** Whether the user has moved focus away from the control. */
  readonly touched = input(false);
  /** Whether the current value differs from the initial form value. */
  readonly dirty = input(false);
  /** Validation and parse errors supplied by the form. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  /** Notifies the form that the native select has lost focus. */
  readonly touch = output();
  /** Stable selector used by automated UI tests. */
  readonly testId = input.required<string>();

  /** Whether validation feedback should be visible to the user. */
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));
  /** Identifier used by the validation feedback. */
  protected readonly errorId = computed(() => `${this.selectId()}-error`);
  /** First validation message supplied by the form, with an accessible fallback. */
  protected readonly errorMessage = computed(
    () => this.errors().find((error) => error.message)?.message ?? 'Revisa este campo.',
  );

  /** Focuses the native select used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.select().nativeElement.focus(options);
  }
}
