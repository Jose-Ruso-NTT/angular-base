import { getRequiredElement } from './dom';

describe('getRequiredElement', () => {
  it('returns the requested typed element', () => {
    const root = document.createElement('div');
    root.innerHTML = '<input id="email" type="email" />';

    const input = getRequiredElement(root, '#email') as HTMLInputElement;

    expect(input.type).toBe('email');
  });

  it('reports the missing selector', () => {
    const root = document.createElement('div');

    expect(() => getRequiredElement(root, '#missing')).toThrow('Missing element: #missing');
  });
});
