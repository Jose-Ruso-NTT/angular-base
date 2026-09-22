import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, FormRoot, disabled, form, required } from '@angular/forms/signals';
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
    <app-select
      label="Numeric select"
      controlId="numeric-select"
      [(value)]="numericSelect"
      [options]="numericOptions"
      testId="numeric-select"
    />
    <app-multiselect
      label="Multi"
      controlId="multi"
      [(value)]="multi"
      [options]="multiOptions"
      testId="multi"
    />
    <app-checkbox label="Enabled" controlId="enabled" [(checked)]="enabled" testId="enabled" />
    <app-radio-group
      label="Priority"
      controlId="priority"
      [(value)]="priority"
      [options]="options"
      orientation="horizontal"
      testId="priority"
    />
    <app-radio-group
      label="Numeric priority"
      controlId="numeric-priority"
      [(value)]="numericPriority"
      [options]="numericOptions"
      testId="numeric-priority"
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
  readonly numericSelect = signal(1);
  readonly multiOptions = [
    { value: { id: 'one', label: 'One' }, label: 'One' },
    { value: { id: 'two', label: 'Two' }, label: 'Two' },
    { value: { id: 'three', label: 'Three' }, label: 'Three', disabled: true },
  ];
  readonly multi = signal([this.multiOptions[0].value]);
  readonly enabled = signal(false);
  readonly priority = signal('one');
  readonly numericPriority = signal(1);
  readonly options = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three', disabled: true },
  ];
  readonly numericOptions = [
    { value: 1, label: 'One' },
    { value: 2, label: 'Two' },
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

@Component({
  imports: [FormField, FormRoot, AppSelect, AppMultiselect, AppRadioGroup],
  template: `
    <form [formRoot]="form">
      <app-select
        label="Select"
        controlId="disabled-select"
        [formField]="form.select"
        [options]="options"
        testId="disabled-select"
      />
      <app-multiselect
        label="Multi"
        controlId="disabled-multi"
        [formField]="form.multi"
        [options]="multiOptions"
        testId="disabled-multi"
      />
      <app-radio-group
        label="Radio"
        controlId="disabled-radio"
        [formField]="form.radio"
        [options]="options"
        testId="disabled-radio"
      />
    </form>
  `,
})
class DisabledFieldsHost {
  readonly options = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
  ];
  readonly multiOptions = this.options.map((option) => ({
    value: { id: option.value, label: option.label },
    label: option.label,
  }));
  private readonly model = signal({
    select: 'one',
    multi: [this.multiOptions[0].value],
    radio: 'one',
  });
  readonly form = form(this.model, (path) => {
    disabled(path.select, { when: () => true });
    disabled(path.multi, { when: () => true });
    disabled(path.radio, { when: () => true });
  });
}

function getRequiredElement(root: ParentNode, selector: string): Element {
  const element = root.querySelector(selector);

  if (element === null) throw new Error(`Missing element: ${selector}`);

  return element;
}

describe('form controls', () => {
  it('uses accessible controls and propagates their values', () => {
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
    const numericSelect = getRequiredElement(nativeElement, '#numeric-select') as HTMLSelectElement;
    const multi = getRequiredElement(nativeElement, '#multi') as HTMLElement;
    const checkbox = getRequiredElement(nativeElement, '#enabled') as HTMLInputElement;
    const radio = getRequiredElement(nativeElement, '#priority-option-1') as HTMLInputElement;
    const numericRadio = getRequiredElement(
      nativeElement,
      '#numeric-priority-option-1',
    ) as HTMLInputElement;

    expect(nativeElement.querySelector('label[for="text"]')?.textContent).toContain('Text');
    expect(
      nativeElement
        .querySelector('fieldset[data-testid="priority"] .options')
        ?.classList.contains('options-horizontal'),
    ).toBe(true);
    expect(
      nativeElement
        .querySelector('fieldset[data-testid="numeric-priority"] .options')
        ?.classList.contains('options-horizontal'),
    ).toBe(false);
    expect(nativeElement.querySelector('label[for="multi"]')).toBeNull();
    expect(nativeElement.querySelector('label#multi-label')?.textContent).toContain('Multi');
    expect(multi.getAttribute('aria-labelledby')).toBe('multi-label');
    expect(nativeElement.innerHTML).toContain('Help');
    expect(select.options[2].disabled).toBe(true);
    expect(nativeElement.querySelector<HTMLInputElement>('#priority-option-2')?.disabled).toBe(
      true,
    );

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
    numericSelect.value = '2';
    numericSelect.dispatchEvent(new Event('change'));
    multi.click();
    fixture.detectChanges();
    const secondMultiOption = Array.from(document.querySelectorAll('[role="option"]')).find(
      (option) => option.textContent.includes('Two'),
    ) as HTMLElement | undefined;
    if (secondMultiOption === undefined) throw new Error('Missing multi-select option Two');
    secondMultiOption.click();
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
    numericRadio.checked = true;
    numericRadio.dispatchEvent(new Event('change'));

    expect(host.text()).toBe('changed');
    expect(host.number()).toBeNull();
    expect(host.date()?.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(host.time()).toBe('14:45');
    expect(host.notes()).toBe('changed note');
    expect(host.select()).toBe('two');
    expect(host.numericSelect()).toBe(2);
    expect(typeof host.numericSelect()).toBe('number');
    expect(host.multi()).toEqual([host.multiOptions[0].value, host.multiOptions[1].value]);
    expect(host.enabled()).toBe(true);
    expect(host.priority()).toBe('two');
    expect(host.numericPriority()).toBe(2);
    expect(typeof host.numericPriority()).toBe('number');
  });

  it('marks disabled multiselect choices as unavailable', () => {
    const fixture = TestBed.configureTestingModule({ imports: [FormControlsHost] }).createComponent(
      FormControlsHost,
    );
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const multi = getRequiredElement(nativeElement, '#multi') as HTMLElement;
    multi.click();
    fixture.detectChanges();

    const disabledMultiOption = Array.from(document.querySelectorAll('[role="option"]')).find(
      (option) => option.textContent.includes('Three'),
    );
    expect(disabledMultiOption?.getAttribute('aria-disabled')).toBe('true');
  });

  it('disables fields configured by Signal Forms', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [DisabledFieldsHost],
    }).createComponent(DisabledFieldsHost);
    fixture.detectChanges();

    const disabledRoot = fixture.nativeElement as HTMLElement;
    expect(getRequiredElement(disabledRoot, '#disabled-select')).toHaveProperty('disabled', true);
    expect(getRequiredElement(disabledRoot, '#disabled-multi').getAttribute('aria-disabled')).toBe(
      'true',
    );
    expect(
      getRequiredElement(disabledRoot, 'fieldset[data-testid="disabled-radio"]'),
    ).toHaveProperty('disabled', true);
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
