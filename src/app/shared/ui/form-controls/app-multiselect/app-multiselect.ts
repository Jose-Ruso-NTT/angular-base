import { OverlayModule } from '@angular/cdk/overlay';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { Component, computed, input, model, output, signal, viewChild } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { AppField } from '../app-field/app-field';
import { injectFieldState } from '../field-state';

/** Primitive value supported by AppMultiselect. */
export type MultiselectValue = string | number;

/** A selectable value rendered by AppMultiselect. */
export interface MultiselectOption {
  /** Value stored in the form control. */
  readonly value: MultiselectValue;
  /** User-facing and accessible option text. */
  readonly label: string;
  /** Prevents selecting this option while keeping it visible. */
  readonly disabled?: boolean;
}

/** Accessible ARIA multiselect wrapper for Signal Forms controls. */
@Component({
  selector: 'app-multiselect',
  imports: [AppField, Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
  styleUrl: './app-multiselect.css',
  template: `
    <app-field [label]="label()" [controlId]="controlId()" [labelFor]="null" [hint]="hint()">
      <div
        #combobox="ngCombobox"
        ngCombobox
        [id]="controlId()"
        (blur)="touch.emit()"
        [(expanded)]="popupExpanded"
        [disabled]="fieldDisabled()"
        [preserveContent]="true"
        class="multiselect-trigger"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-labelledby]="labelId()"
        [attr.aria-invalid]="showError()"
        [attr.aria-required]="fieldRequired()"
        [attr.data-testid]="testId()"
      >
        <span class="multiselect-value">{{ displayValue() }}</span>
        <span class="multiselect-arrow" aria-hidden="true"></span>
      </div>

      <ng-template
        [cdkConnectedOverlay]="{ origin: combobox.element, usePopover: 'inline' }"
        [cdkConnectedOverlayMatchWidth]="true"
        [cdkConnectedOverlayOpen]="popupExpanded()"
      >
        <ng-template ngComboboxPopup [combobox]="combobox">
          <div class="multiselect-popup">
            <div
              #listbox="ngListbox"
              ngListbox
              [multi]="true"
              ngComboboxWidget
              focusMode="activedescendant"
              [tabindex]="-1"
              selectionMode="explicit"
              [(value)]="value"
              [disabled]="fieldDisabled()"
              [activeDescendant]="listbox.activeDescendant()"
            >
              @for (option of options(); track option.value) {
                <div
                  ngOption
                  [value]="option.value"
                  [label]="option.label"
                  [disabled]="option.disabled ?? false"
                >
                  <span>{{ option.label }}</span>
                  <span class="multiselect-check" aria-hidden="true">✓</span>
                </div>
              }
            </div>
          </div>
        </ng-template>
      </ng-template>
    </app-field>
  `,
})
export class AppMultiselect implements FormValueControl<MultiselectValue[]> {
  private readonly field = injectFieldState();

  readonly combobox = viewChild.required<Combobox>('combobox');

  /** Label visibly associated with the ARIA combobox trigger. */
  readonly label = input.required<string>();
  /** Identifier shared by label, select and support text. */
  readonly controlId = input.required<string>();
  /** Selected primitive values managed by the parent Signal Form. */
  readonly value = model.required<MultiselectValue[]>();
  /** Options available to select. Object values are intentionally unsupported. */
  readonly options = input.required<readonly MultiselectOption[]>();
  /**
   * Help text displayed until a validation error is shown.
   * @default ''
   */
  readonly hint = input('');
  /** Notifies Signal Forms that the select lost focus. */
  readonly touch = output();
  /** Stable selector used by automated UI tests. */
  readonly testId = input.required<string>();

  protected readonly fieldDisabled = this.field.disabled;
  protected readonly fieldRequired = this.field.required;
  protected readonly showError = this.field.showError;
  protected readonly popupExpanded = signal(false);
  protected readonly displayValue = computed(() => {
    const selected = this.value();
    if (selected.length === 0) return 'Selecciona opciones';

    const labels = selected.map((value) => this.displayLabelFor(value));
    return labels.length === 1 ? labels[0] : `${labels[0]} + ${(labels.length - 1).toString()} más`;
  });
  protected readonly describedBy = computed(() => {
    if (this.showError()) return `${this.controlId()}-error`;
    if (this.hint()) return `${this.controlId()}-hint`;
    return null;
  });
  protected readonly labelId = computed(() => `${this.controlId()}-label`);

  /** Finds the display label for a selected value. */
  private displayLabelFor(value: MultiselectValue): string {
    return this.options().find((option) => option.value === value)?.label ?? '';
  }

  /** Focuses the ARIA combobox trigger used by this custom form control. */
  focus(options?: FocusOptions): void {
    this.combobox().element.focus(options);
  }
}
