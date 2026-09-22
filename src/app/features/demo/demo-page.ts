import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { AppCheckbox } from '../../shared/ui/app-checkbox/app-checkbox';
import { AppDate } from '../../shared/ui/app-date/app-date';
import { AppInput } from '../../shared/ui/app-input/app-input';
import { AppMultiselect } from '../../shared/ui/app-multiselect/app-multiselect';
import { AppNumber } from '../../shared/ui/app-number/app-number';
import { AppRadioGroup } from '../../shared/ui/app-radio-group/app-radio-group';
import { AppSelect, type SelectOption } from '../../shared/ui/app-select/app-select';
import { AppTextarea } from '../../shared/ui/app-textarea/app-textarea';
import { AppTime } from '../../shared/ui/app-time/app-time';

interface Team {
  readonly id: string;
  readonly name: string;
}

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
  protected readonly deliveryDate = signal<Date | null>(new Date('2026-10-15T00:00:00.000Z'));
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
    { value: 'complete', label: 'Completado' },
  ];
  protected readonly priorityOptions: readonly SelectOption[] = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
  ];
  protected readonly teams: readonly Team[] = [
    { id: 'design', name: 'Dise\u00f1o' },
    { id: 'development', name: 'Desarrollo' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'sales', name: 'Ventas' },
  ];
  protected readonly selectedTeams = signal<Team[]>([this.teams[0], this.teams[1]]);
  protected readonly teamLabel = (team: Team): string => team.name;
  protected readonly teamTrackBy = (team: Team): string => team.id;
  protected readonly liveValues = computed(() => ({
    nombre: this.name(),
    correo: this.email(),
    importe: this.amount(),
    fecha: this.deliveryDate()?.toLocaleDateString('es-ES') ?? null,
    hora: this.deliveryTime(),
    estado: this.status(),
    prioridad: this.priority(),
    equipos: this.selectedTeams().map((team) => team.name),
    novedades: this.newsletter(),
  }));

  protected reset(): void {
    this.name.set('Ana Garc\u00eda');
    this.email.set('ana@example.com');
    this.amount.set(249.95);
    this.deliveryDate.set(new Date('2026-10-15T00:00:00.000Z'));
    this.deliveryTime.set('10:30');
    this.notes.set(
      'A\u00f1ade aqu\u00ed cualquier observaci\u00f3n para probar el comportamiento.',
    );
    this.status.set('in-progress');
    this.priority.set('medium');
    this.selectedTeams.set([this.teams[0], this.teams[1]]);
    this.newsletter.set(true);
  }
}
