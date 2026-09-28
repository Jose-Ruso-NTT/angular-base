import type { FieldContext } from '@angular/forms/signals';

/** Creates a Signal Forms validator that rejects non-integer numeric values. */
export function integer(message: string) {
  return (context: FieldContext<number | null>) => {
    const value = context.value();

    return value !== null && !Number.isInteger(value)
      ? {
          kind: 'integer',
          message,
        }
      : null;
  };
}
