import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { AppCheckbox } from '@shared/ui/form-controls/app-checkbox/app-checkbox';
import { AppDate, type LocalDate } from '@shared/ui/form-controls/app-date/app-date';
import { AppInput } from '@shared/ui/form-controls/app-input/app-input';
import {
  AppMultiselect,
  type MultiselectOption,
} from '@shared/ui/form-controls/app-multiselect/app-multiselect';
import { AppNumber } from '@shared/ui/form-controls/app-number/app-number';
import {
  AppRadioGroup,
  RadioOption,
} from '@shared/ui/form-controls/app-radio-group/app-radio-group';
import { AppSelect, type SelectOption } from '@shared/ui/form-controls/app-select/app-select';
import { AppTextarea } from '@shared/ui/form-controls/app-textarea/app-textarea';
import { AppTime } from '@shared/ui/form-controls/app-time/app-time';

@Component({
  selector: 'app-demo-page',
  imports: [
    AppInput,
    AppNumber,
    AppDate,
    AppTime,
    AppTextarea,
    AppSelect,
    AppMultiselect,
    AppCheckbox,
    AppRadioGroup,
    JsonPipe,
  ],
  styleUrl: './demo-page.css',
  templateUrl: './demo-page.html',
})
export class DemoPage {
  protected readonly name = signal('Ana Garc\u00eda');
  protected readonly email = signal('ana@example.com');
  protected readonly amount = signal<number | null>(249.95);
  protected readonly deliveryDate = signal<LocalDate | null>('2026-10-15');
  protected readonly deliveryTime = signal('10:30');
  protected readonly notes = signal(
    'A\u00f1ade aqu\u00ed cualquier observaci\u00f3n para probar el comportamiento.',
  );
  protected readonly status = signal('in-progress');
  protected readonly priority = signal('medium');
  protected readonly newsletter = signal(true);
  protected readonly statusOptions: readonly SelectOption[] = [
    { value: 'draft', label: 'Borrador' },
    { value: 'in-progress', label: 'En progreso' },
    { value: 'complete', label: 'Completado', disabled: true },
  ];
  protected readonly priorityOptions: readonly RadioOption[] = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta', disabled: true },
  ];
  protected readonly teams: readonly MultiselectOption[] = [
    { value: 'design', label: 'Dise\u00f1o' },
    { value: 'development', label: 'Desarrollo' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Ventas', disabled: true },
  ];
  protected readonly selectedTeams = signal(['design', 'development']);
  protected readonly liveValues = computed(() => ({
    nombre: this.name(),
    correo: this.email(),
    importe: this.amount(),
    fecha: this.deliveryDate(),
    hora: this.deliveryTime(),
    estado: this.status(),
    prioridad: this.priority(),
    equipos: this.selectedTeams(),
    novedades: this.newsletter(),
  }));

  protected reset(): void {
    this.name.set('Ana Garc\u00eda');
    this.email.set('ana@example.com');
    this.amount.set(249.95);
    this.deliveryDate.set('2026-10-15');
    this.deliveryTime.set('10:30');
    this.notes.set(
      'A\u00f1ade aqu\u00ed cualquier observaci\u00f3n para probar el comportamiento.',
    );
    this.status.set('in-progress');
    this.priority.set('medium');
    this.selectedTeams.set(['design', 'development']);
    this.newsletter.set(true);
  }
}
