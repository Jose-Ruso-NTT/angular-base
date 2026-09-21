import type { FieldTree } from '@angular/forms/signals';

/** Focuses the first invalid control bound to the submitted Signal Form. */
export function focusBoundControl(fieldTree: FieldTree<unknown>): void {
  const firstError = fieldTree().errorSummary()[0];

  firstError.fieldTree().focusBoundControl();
}
