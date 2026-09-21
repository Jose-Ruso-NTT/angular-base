import { Component, computed, ElementRef, inject, input, model, output } from '@angular/core';
import {
  FormValueControl,
  ValidationError,
  WithOptionalFieldTree,
  transformedValue,
} from '@angular/forms/signals';

/** Accessible native-input wrapper for Signal Forms controls. */
@Component({
  selector: 'app-input',
  styleUrl: './app-input.component.css',
  template: `
    <div class="field">
      <label [for]="inputId()"
        >{{ label() }}
        @if (required()) {
          <span aria-hidden="true">*</span>
        }
      </label>
      <input
        [id]="inputId()"
        [type]="type()"
        [value]="rawValue()"
        (input)="rawValue.set($event.target.value)"
        (blur)="touch.emit()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [attr.autocomplete]="autocomplete()"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="showError()"
        [attr.aria-required]="required()"
        [attr.data-testid]="testId()"
      />
      <div class="support">
        @if (showError()) {
          <p class="error" [id]="errorId()" role="alert">{{ errorMessage() }}</p>
        } @else if (hint()) {
          <p class="hint" [id]="hintId()">{{ hint() }}</p>
        }
      </div>
    </div>
  `,
})
export class AppInputComponent implements FormValueControl<string | number | null> {
  private readonly elementRef = inject(ElementRef).nativeElement as HTMLElement;

  /** Label visibly associated with the native input. */
  readonly label = input.required<string>();
  /** Value managed by the parent Signal Form through the formField directive. */
  readonly value = model.required<string | number | null>();
  /** Native input type. Defaults to text. */
  readonly type = input<'text' | 'number' | 'search'>('text');
  /** Identifier shared by label, input and error text. */
  readonly inputId = input.required<string>();
  /** Help text displayed until a validation error is shown. */
  readonly hint = input('');
  /** Expected browser autofill token. */
  readonly autocomplete = input('off');
  /** Minimum value for numeric inputs. */
  readonly min = input<string | number | undefined>(undefined);
  /** Maximum value for numeric inputs. */
  readonly max = input<string | number | undefined>(undefined);
  /** Numeric input increment. */
  readonly step = input<number | null>(null);
  /** Validation and interaction state provided by the formField directive. */
  readonly required = input(false);
  /** Whether the form prevents editing the control. */
  readonly disabled = input(false);
  /** Whether the form exposes the control as read-only. */
  readonly readonly = input(false);
  /** Whether the form has reported one or more validation errors. */
  readonly invalid = input(false);
  /** Whether the user has moved focus away from the control. */
  readonly touched = input(false);
  /** Whether the current value differs from the initial form value. */
  readonly dirty = input(false);
  /** Validation and parse errors supplied by the form. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  /** Notifies the form that the native input has lost focus. */
  readonly touch = output();
  /** Stable selector used by automated UI tests. */
  readonly testId = input.required<string>();

  /** Whether validation feedback should be visible to the user. */
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));
  /** Native string value transformed to and from the form model value. */
  protected readonly rawValue = transformedValue(this.value, {
    parse: (rawValue: string) => ({
      value: this.type() === 'number' ? (rawValue === '' ? null : Number(rawValue)) : rawValue,
    }),
    format: (value) => (value == null ? '' : String(value)),
  });
  /** Identifier used by the optional help text. */
  protected readonly hintId = computed(() => `${this.inputId()}-hint`);
  /** Identifier used by the validation feedback. */
  protected readonly errorId = computed(() => `${this.inputId()}-error`);
  /** Selects the appropriate ARIA description for the current state. */
  protected readonly describedBy = computed(() =>
    this.showError() ? this.errorId() : this.hint() ? this.hintId() : null,
  );
  /** First validation message supplied by the form, with an accessible fallback. */
  protected readonly errorMessage = computed(
    () => this.errors().find((error) => error.message)?.message ?? 'Revisa este campo.',
  );

  /** Focuses the native input used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.elementRef.querySelector('input')?.focus(options);
  }
}
