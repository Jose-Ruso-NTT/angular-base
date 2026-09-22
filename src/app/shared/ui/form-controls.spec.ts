import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { AppCheckbox } from './app-checkbox/app-checkbox';
import { AppDate } from './app-date/app-date';
import { AppInput } from './app-input/app-input';
import { AppMultiselect } from './app-multiselect/app-multiselect';
import { AppNumber } from './app-number/app-number';
import { AppRadioGroup } from './app-radio-group/app-radio-group';
import { AppSelect } from './app-select/app-select';
import { AppTextarea } from './app-textarea/app-textarea';
import { AppTime } from './app-time/app-time';

@Component({
  imports: [
    AppInput,
    AppNumber,
    AppRadioGroup,
    AppDate,
    AppTime,
    AppTextarea,
    AppSelect,
    AppMultiselect,
    AppCheckbox,
  ],
  template: `
    <app-input label="Text" controlId="text" [(value)]="text" testId="text" hint="Help" />
    <app-number label="Number" controlId="number" [(value)]="number" testId="number" />
    <app-date label="Date" controlId="date" [(value)]="date" testId="date" />
    <app-time label="Time" controlId="time" [(value)]="time" testId="time" />
    <app-textarea label="Notes" controlId="notes" [(value)]="notes" testId="notes" />
    <app-select
      label="Select"
      controlId="select"
      [(value)]="select"
      [options]="options"
      testId="select"
    />
    <app-multiselect
      label="Multi"
      controlId="multi"
      [(value)]="multi"
      [options]="options"
      testId="multi"
    />
    <app-checkbox label="Enabled" controlId="enabled" [(checked)]="enabled" testId="enabled" />
    <app-radio-group
      label="Priority"
      controlId="priority"
      [(value)]="priority"
      [options]="options"
      testId="priority"
    />
  `,
})
class FormControlsHost {
  readonly text = signal('initial');
  readonly number = signal<number | null>(4);
  readonly date = signal<Date | null>(new Date('2026-09-22T00:00:00.000Z'));
  readonly time = signal('09:30');
  readonly notes = signal('note');
  readonly select = signal('one');
  readonly multi = signal(['one']);
  readonly enabled = signal(false);
  readonly priority = signal('one');
  readonly options = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
  ];
}

@Component({
  imports: [FormField, FormRoot, AppInput],
  template: `
    <form [formRoot]="form">
      <app-input
        label="Name"
        controlId="name"
        [formField]="form.name"
        hint="Enter a name"
        testId="name"
      />
    </form>
  `,
})
class BoundFieldHost {
  private readonly model = signal({ name: '' });
  readonly form = form(this.model, (path) => {
    required(path.name, { message: 'Name is required.' });
  });
}

function getRequiredElement(root: ParentNode, selector: string): Element {
  const element = root.querySelector(selector);

  if (element === null) throw new Error(`Missing element: ${selector}`);

  return element;
}

describe('form controls', () => {
  it('uses native values and exposes accessible native controls', () => {
    const fixture = TestBed.configureTestingModule({ imports: [FormControlsHost] }).createComponent(
      FormControlsHost,
    );
    fixture.detectChanges();
    fixture.detectChanges();

    const host = fixture.componentInstance;
    const nativeElement = fixture.nativeElement as HTMLElement;
    const text = getRequiredElement(nativeElement, '#text') as HTMLInputElement;
    const number = getRequiredElement(nativeElement, '#number') as HTMLInputElement;
    const date = getRequiredElement(nativeElement, '#date') as HTMLInputElement;
    const time = getRequiredElement(nativeElement, '#time') as HTMLInputElement;
    const textarea = getRequiredElement(nativeElement, '#notes') as HTMLTextAreaElement;
    const select = getRequiredElement(nativeElement, '#select') as HTMLSelectElement;
    const multi = getRequiredElement(nativeElement, '#multi') as HTMLSelectElement;
    const checkbox = getRequiredElement(nativeElement, '#enabled') as HTMLInputElement;
    const radio = getRequiredElement(nativeElement, '#priority-option-1') as HTMLInputElement;

    expect(nativeElement.querySelector('label[for="text"]')?.textContent).toContain('Text');
    expect(nativeElement.innerHTML).toContain('Help');

    text.value = 'changed';
    text.dispatchEvent(new Event('input'));
    number.value = '';
    number.dispatchEvent(new Event('input'));
    date.valueAsDate = new Date('2026-10-01T00:00:00.000Z');
    date.dispatchEvent(new Event('input'));
    time.value = '14:45';
    time.dispatchEvent(new Event('input'));
    textarea.value = 'changed note';
    textarea.dispatchEvent(new Event('input'));
    select.value = 'two';
    select.dispatchEvent(new Event('change'));
    multi.options[0].selected = false;
    multi.options[1].selected = true;
    multi.dispatchEvent(new Event('change'));
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));

    expect(host.text()).toBe('changed');
    expect(host.number()).toBeNull();
    expect(host.date()?.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(host.time()).toBe('14:45');
    expect(host.notes()).toBe('changed note');
    expect(host.select()).toBe('two');
    expect(host.multi()).toEqual(['two']);
    expect(host.enabled()).toBe(true);
    expect(host.priority()).toBe('two');
  });

  it('shows Signal Forms errors after blur and replaces the hint', () => {
    const fixture = TestBed.configureTestingModule({ imports: [BoundFieldHost] }).createComponent(
      BoundFieldHost,
    );
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const input = getRequiredElement(nativeElement, 'input#name') as HTMLInputElement;
    expect(input.getAttribute('aria-describedby')).toBe('name-hint');
    expect(nativeElement.querySelector('#name-error')).toBeNull();

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(input.getAttribute('aria-describedby')).toBe('name-error');
    expect(nativeElement.querySelector('#name-error')?.textContent).toContain('Name is required.');
    expect(nativeElement.querySelector('#name-hint')).toBeNull();
  });
});
