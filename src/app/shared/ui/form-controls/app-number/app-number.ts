import {
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { AppFieldShell } from '../app-field-shell/app-field-shell';
import { injectFieldState } from '../field-state';

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
        [value]="displayValue()"
        (focus)="editing.set(true)"
        (input)="setNativeValue(input)"
        (blur)="onBlur()"
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

  /**
   * Whether the user is actively editing the native input.
   *
   * While editing, the browser owns the textual representation so partial
   * numeric values and the caret position are not overwritten by Angular.
   */
  protected readonly editing = signal(false);

  /**
   * Value written from the Signal Form into the native input.
   *
   * The value remains stable while the user is editing. This prevents
   * Angular from normalizing representations such as localized decimals,
   * trailing zeros or other intermediate numeric states on every keystroke.
   */
  protected readonly displayValue = linkedSignal({
    source: () => ({
      value: this.value(),
      editing: this.editing(),
    }),
    computation: ({ value, editing }, previous) => {
      if (editing && previous) {
        return previous.value;
      }

      return value === null ? '' : String(value);
    },
  });

  protected readonly describedBy = computed(() => {
    if (this.showError()) return `${this.controlId()}-error`;
    if (this.hint()) return `${this.controlId()}-hint`;
    return null;
  });

  /**
   * Synchronizes the native numeric value with the Signal Form without
   * replacing the text currently being edited by the user.
   */
  protected setNativeValue(input: HTMLInputElement): void {
    if (input.validity.badInput) {
      return;
    }

    if (input.value === '') {
      this.value.set(null);
      return;
    }

    const nativeValue = input.valueAsNumber;

    if (!Number.isNaN(nativeValue)) {
      this.value.set(nativeValue);
    }
  }

  /**
   * Finishes the native editing session and notifies Signal Forms that the
   * control has been touched.
   */
  protected onBlur(): void {
    this.editing.set(false);
    this.touch.emit();
  }

  /** Focuses the native number input used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.input().nativeElement.focus(options);
  }
}
