import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { email, FormField, FormRoot, form, min, required, validate } from '@angular/forms/signals';
import { AppControl } from '@shared/ui/form-controls/app-control/app-control';
import { AppField } from '@shared/ui/form-controls/app-field/app-field';
import {
  AppMultiselect,
  type MultiselectOption,
} from '@shared/ui/form-controls/app-multiselect/app-multiselect';

interface DemoFormModel {
  name: string;
  email: string;
  amount: number | null;
  deliveryDate: Date | null;
  deliveryTime: string;
  notes: string;
  status: string;
  priority: string;
  teams: string[];
  newsletter: boolean;
}

@Component({
  selector: 'app-demo-page',
  imports: [AppControl, AppField, AppMultiselect, FormField, FormRoot, JsonPipe],
  styleUrl: './demo-page.css',
  templateUrl: './demo-page.html',
})
export class DemoPage {
  private readonly model = signal<DemoFormModel>(createDemoFormInitialValue());
  protected readonly submissionMessage = signal('');
  protected readonly form = form(
    this.model,
    (path) => {
      required(path.name, { message: 'El nombre es obligatorio.' });
      required(path.email, { message: 'El correo es obligatorio.' });
      email(path.email, { message: 'Introduce un correo electr\u00f3nico v\u00e1lido.' });
      required(path.amount, { message: 'El importe es obligatorio.' });
      min(path.amount, 0, { message: 'El importe no puede ser negativo.' });
      required(path.deliveryDate, { message: 'Introduce una fecha v\u00e1lida.' });
      required(path.deliveryTime, { message: 'La hora de entrega es obligatoria.' });
      validate(path.deliveryTime, (context) => {
        const value = context.value();
        return value !== '' && (value < '08:00' || value > '20:00')
          ? {
              kind: 'deliveryTimeRange',
              message: 'La hora debe estar entre las 08:00 y las 20:00.',
            }
          : null;
      });
      required(path.status, { message: 'Selecciona un estado.' });
      required(path.priority, { message: 'Selecciona una prioridad.' });
    },
    {
      submission: {
        action: () => {
          this.submissionMessage.set(
            'Formulario v\u00e1lido. El env\u00edo se ha interceptado en la demo.',
          );
          return Promise.resolve();
        },
      },
    },
  );
  protected readonly statusOptions = [
    { value: 'draft', label: 'Borrador' },
    { value: 'in-progress', label: 'En progreso' },
    { value: 'complete', label: 'Completado', disabled: true },
  ];
  protected readonly priorityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
  ];
  protected readonly teams: readonly MultiselectOption[] = [
    { value: 'design', label: 'Dise\u00f1o' },
    { value: 'development', label: 'Desarrollo' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Ventas', disabled: true },
  ];
  protected readonly liveValues = computed(() => ({
    nombre: this.form().value().name,
    correo: this.form().value().email,
    importe: this.form().value().amount,
    fecha: this.form().value().deliveryDate,
    hora: this.form().value().deliveryTime,
    estado: this.form().value().status,
    prioridad: this.form().value().priority,
    equipos: this.form().value().teams,
    novedades: this.form().value().newsletter,
  }));

  protected reset(): void {
    this.submissionMessage.set('');
    this.form().reset(createDemoFormInitialValue());
  }
}

/** Produces a fresh model so reset does not reuse mutable multi-select selections. */
function createDemoFormInitialValue(): DemoFormModel {
  return {
    name: 'Ana Garc\u00eda',
    email: 'ana@example.com',
    amount: 249.95,
    deliveryDate: new Date(2026, 9, 15),
    deliveryTime: '10:30',
    notes: 'A\u00f1ade aqu\u00ed cualquier observaci\u00f3n para probar el comportamiento.',
    status: 'in-progress',
    priority: 'medium',
    teams: ['design', 'development'],
    newsletter: true,
  };
}
