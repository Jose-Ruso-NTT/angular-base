import type { FieldContext } from '@angular/forms/signals';
import { integer } from './integer.validator';

function createContext(value: number | null): FieldContext<number | null> {
  return { value: () => value } as FieldContext<number | null>;
}

describe('integer', () => {
  const validateInteger = integer('Must be an integer.');

  it.each([null, 0, 12, -4])('accepts %s', (value) => {
    expect(validateInteger(createContext(value))).toBeNull();
  });

  it('rejects decimals with the configured message', () => {
    expect(validateInteger(createContext(12.5))).toEqual({
      kind: 'integer',
      message: 'Must be an integer.',
    });
  });
});
