import { computed, inject } from '@angular/core';
import { FORM_FIELD } from '@angular/forms/signals';

/** Reads presentation state exposed by a Signal Forms field binding. */
export function injectFieldState() {
  const formField = inject(FORM_FIELD, { optional: true });
  const state = computed(() => formField?.state());

  return {
    formField,
    state,
    disabled: computed(() => state()?.disabled() ?? false),
    readonly: computed(() => state()?.readonly() ?? false),
    required: computed(() => state()?.required() ?? false),
    showError: computed(() => !!state()?.touched() && !!state()?.invalid()),
  };
}
