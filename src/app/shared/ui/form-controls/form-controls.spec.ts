import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { getRequiredElement } from '@shared/testing/dom';
import { AppControl } from './app-control/app-control';
import { AppField } from './app-field/app-field';
import { AppMultiselect } from './app-multiselect/app-multiselect';

@Component({
  imports: [AppControl, AppField, AppMultiselect, FormField, FormRoot],
  template: `
    <form [formRoot]="form">
      <app-field label="Text" hint="Help"
        ><input appControl id="text" [formField]="form.text" data-testid="text"
      /></app-field>
      <app-field label="Number"
        ><input appControl id="number" type="number" [formField]="form.number"
      /></app-field>
      <app-field label="Date"
        ><input appControl id="date" type="date" [formField]="form.date"
      /></app-field>
      <app-field label="Time"
        ><input appControl id="time" type="time" [formField]="form.time"
      /></app-field>
      <app-field label="Notes">
        <textarea appControl id="notes" [formField]="form.notes"></textarea>
      </app-field>
      <app-field label="Select"
        ><select appControl id="select" [formField]="form.select">
          <option value="one">One</option>
          <option value="two">Two</option>
        </select></app-field
      >
      <app-field label="Enabled" layout="checkbox"
        ><input appControl id="enabled" type="checkbox" [formField]="form.enabled"
      /></app-field>
      <app-field label="Priority" layout="radio">
        <div>
          @for (option of priorityOptions; track option.value; let index = $index) {
            <label [for]="'priority-' + index">
              <input
                appControl
                [id]="'priority-' + index"
                type="radio"
                [value]="option.value"
                [formField]="form.priority"
              />{{ option.label }}
            </label>
          }
        </div>
      </app-field>
      <app-multiselect
        label="Multi"
        controlId="multi"
        [formField]="form.multi"
        [options]="multiOptions"
        testId="multi"
      />
    </form>
  `,
})
class FormControlsHost {
  private readonly model = signal<{
    text: string;
    number: number | null;
    date: Date | null;
    time: string;
    notes: string;
    select: string;
    enabled: boolean;
    priority: string;
    multi: string[];
  }>({
    text: 'initial',
    number: 4,
    date: new Date(2026, 8, 22),
    time: '09:30',
    notes: 'note',
    select: 'one',
    enabled: false,
    priority: 'one',
    multi: ['one'],
  });
  readonly form = form(this.model, (path) => {
    required(path.text, { message: 'Text is required.' });
  });
  readonly multiOptions = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
  ];
  readonly priorityOptions = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
  ];
}

describe('form controls', () => {
  it('uses native controls with Signal Forms values and shared presentation', () => {
    const fixture = TestBed.configureTestingModule({ imports: [FormControlsHost] }).createComponent(
      FormControlsHost,
    );
    fixture.detectChanges();
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const text = getRequiredElement(root, '#text') as HTMLInputElement;
    const number = getRequiredElement(root, '#number') as HTMLInputElement;
    const date = getRequiredElement(root, '#date') as HTMLInputElement;
    const time = getRequiredElement(root, '#time') as HTMLInputElement;
    const notes = getRequiredElement(root, '#notes') as HTMLTextAreaElement;
    const select = getRequiredElement(root, '#select') as HTMLSelectElement;
    const enabled = getRequiredElement(root, '#enabled') as HTMLInputElement;
    const priority = getRequiredElement(root, '#priority-1') as HTMLInputElement;

    expect(root.querySelector('label[for="text"]')?.textContent).toContain('Text');
    expect(text.classList.contains('app-control')).toBe(true);
    expect(text.getAttribute('aria-describedby')).toBe('text-hint');
    text.value = 'changed';
    text.dispatchEvent(new Event('input'));
    number.value = '';
    number.dispatchEvent(new Event('input'));
    date.value = '2026-10-01';
    date.dispatchEvent(new Event('input'));
    time.value = '14:45';
    time.dispatchEvent(new Event('input'));
    notes.value = 'changed note';
    notes.dispatchEvent(new Event('input'));
    select.value = 'two';
    select.dispatchEvent(new Event('input'));
    enabled.checked = true;
    enabled.dispatchEvent(new Event('input'));
    priority.checked = true;
    priority.dispatchEvent(new Event('input'));

    expect(host.form.text().value()).toBe('changed');
    expect(host.form.number().value()).toBeNull();
    expect(host.form.date().value()?.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(host.form.time().value()).toBe('14:45');
    expect(host.form.notes().value()).toBe('changed note');
    expect(host.form.select().value()).toBe('two');
    expect(host.form.enabled().value()).toBe(true);
    expect(host.form.priority().value()).toBe('two');
  });

  it('shows Signal Forms feedback after blur and replaces the hint', () => {
    const fixture = TestBed.configureTestingModule({ imports: [FormControlsHost] }).createComponent(
      FormControlsHost,
    );
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const input = getRequiredElement(root, '#text') as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('text-error');
    expect(root.querySelector('#text-error')?.textContent).toContain('Text is required.');
    expect(root.querySelector('#text-hint')).toBeNull();
  });

  it('keeps the custom multiselect for multi-value selection', () => {
    const fixture = TestBed.configureTestingModule({ imports: [FormControlsHost] }).createComponent(
      FormControlsHost,
    );
    fixture.detectChanges();
    const multi = getRequiredElement(fixture.nativeElement as HTMLElement, '#multi') as HTMLElement;
    expect(multi.getAttribute('aria-labelledby')).toBe('multi-label');
  });
});
