import {
  afterEveryRender,
  afterRenderEffect,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  Renderer2,
  signal,
} from '@angular/core';
import { FORM_FIELD, FormField, type FieldState } from '@angular/forms/signals';

type FieldLayout = 'default' | 'checkbox' | 'radio';

/** Labels, describes and renders Signal Forms feedback for a projected native control. */
@Component({
  selector: 'app-field',
  styleUrl: './app-field.css',
  template: `
    <div class="field" [class.field-checkbox]="layout() === 'checkbox'">
      @if (layout() === 'radio') {
        <span class="field-legend" [id]="labelId()">
          {{ label() }}
          @if (required()) {
            <span aria-hidden="true">*</span>
          }
        </span>
      } @else if (labelFor() === null) {
        <span class="field-legend" [id]="labelId()">
          {{ label() }}
          @if (required()) {
            <span aria-hidden="true">*</span>
          }
        </span>
      } @else {
        <label [id]="labelId()" [attr.for]="labelFor() ?? resolvedControlId()">
          {{ label() }}
          @if (required()) {
            <span aria-hidden="true">*</span>
          }
        </label>
      }
      <div
        class="field-control"
        [attr.role]="layout() === 'radio' ? 'radiogroup' : null"
        [attr.aria-labelledby]="layout() === 'radio' ? labelId() : null"
        [attr.aria-describedby]="layout() === 'radio' ? describedBy() : null"
        [attr.aria-invalid]="layout() === 'radio' ? showError() : null"
      >
        <ng-content />
      </div>

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
export class AppField {
  private readonly renderer = inject(Renderer2);
  /** The visible label for the projected control. */
  readonly label = input.required<string>();
  /** Help text displayed until validation feedback is shown. */
  readonly hint = input('');
  /** Explicit control ID for a composite control whose form binding lives on its host. */
  readonly controlId = input<string | undefined>(undefined);
  /** Set to null when the projected widget is labelled through aria-labelledby. */
  readonly labelFor = input<string | null | undefined>(undefined);
  /** Layout needed by native checkbox and radio controls. */
  readonly layout = input<FieldLayout>('default');

  /** The projected native binding, or the binding inherited from a composite-control host. */
  private readonly projectedField = contentChild(FormField);
  private readonly hostField = inject(FORM_FIELD, { optional: true });
  protected readonly field = computed(() => this.projectedField() ?? this.hostField);
  private readonly fieldState = signal<FieldState<unknown> | null>(null);
  protected readonly resolvedControlId = signal<string | null>(null);
  protected readonly labelId = computed(() => {
    const controlId = this.resolvedControlId();
    return controlId === null ? null : `${controlId}-label`;
  });
  protected readonly hintId = computed(() => {
    const controlId = this.resolvedControlId();
    return controlId === null ? null : `${controlId}-hint`;
  });
  protected readonly errorId = computed(() => {
    const controlId = this.resolvedControlId();
    return controlId === null ? null : `${controlId}-error`;
  });
  protected readonly required = computed(() => this.fieldState()?.required() ?? false);
  protected readonly showError = computed(() => {
    const state = this.fieldState();
    return state !== null && state.touched() && state.invalid();
  });
  protected readonly describedBy = computed(() => {
    if (this.showError()) return this.errorId();
    return this.hint() ? this.hintId() : null;
  });
  protected readonly errorMessage = computed(
    () => this.field()?.errors()[0]?.message ?? 'Revisa este campo.',
  );

  constructor() {
    afterEveryRender(() => {
      const id = this.controlId() ?? this.field()?.element.id;
      this.resolvedControlId.set(id === undefined || id === '' ? null : id);
    });

    afterRenderEffect(() => {
      this.fieldState.set(this.field()?.state() ?? null);
    });

    effect(() => {
      const element = this.field()?.element;
      if (element === undefined) return;
      setOptionalAttribute(this.renderer, element, 'aria-describedby', this.describedBy());
      this.renderer.setAttribute(element, 'aria-invalid', String(this.showError()));
      this.renderer.setAttribute(element, 'aria-required', String(this.required()));
    });
  }
}

function setOptionalAttribute(
  renderer: Renderer2,
  element: HTMLElement,
  name: string,
  value: string | null,
): void {
  if (value === null) renderer.removeAttribute(element, name);
  else renderer.setAttribute(element, name, value);
}
