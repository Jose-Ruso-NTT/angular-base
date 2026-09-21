import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  type FieldTree,
  type TreeValidationResult,
  form,
  maxLength,
  min,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { ProductsService } from '../../core/api/generated';
import type { ProductInput, ProductOutput } from '../../core/api/generated/schemas';
import { AppInputComponent } from '../../shared/ui/app-input/app-input.component';
import {
  AppSelectComponent,
  type SelectOption,
} from '../../shared/ui/app-select/app-select.component';
import { APP_DIALOG_DATA, AppDialogRef } from '../../shared/ui/dialog/app-dialog.service';
import { focusBoundControl } from '../../shared/forms/focus-bound-control';

/** Data accepted by the product editor dialog. Omitting product creates a new item. */
export interface ProductFormDialogData {
  /** Existing product to edit. */
  readonly product?: ProductOutput;
}

interface ProductFormModel {
  name: string;
  description: string;
  sku: string;
  price: number | null;
  stock: number | null;
  status: string;
}

/** Product creation and editing form displayed through the dialog wrapper. */
@Component({
  selector: 'app-product-form-dialog',
  imports: [FormField, FormRoot, AppInputComponent, AppSelectComponent],
  styleUrl: './product-form-dialog.component.css',
  template: `
    <section class="dialog" aria-labelledby="product-form-title">
      <header>
        <h2 id="product-form-title">{{ title() }}</h2>
        <p>Los campos marcados con <span aria-hidden="true">*</span> son obligatorios.</p>
      </header>
      @if (submitError()) {
        <p class="submit-error" role="alert">{{ submitError() }}</p>
      }
      <form [formRoot]="form">
        <app-input
          label="Nombre"
          inputId="product-name"
          [formField]="form.name"
          autocomplete="off"
          testId="product-name-input"
        />
        <app-input
          label="SKU"
          inputId="product-sku"
          [formField]="form.sku"
          hint="De 3 a 32 caracteres: mayúsculas, números y guiones."
          autocomplete="off"
          testId="product-sku-input"
        />
        <app-input
          label="Descripción"
          inputId="product-description"
          [formField]="form.description"
          autocomplete="off"
          testId="product-description-input"
        />
        <div class="two-columns">
          <app-input
            label="Precio (€)"
            inputId="product-price"
            type="number"
            [formField]="form.price"
            [step]="0.01"
            testId="product-price-input"
          />
          <app-input
            label="Stock"
            inputId="product-stock"
            type="number"
            [formField]="form.stock"
            [step]="1"
            testId="product-stock-input"
          />
        </div>
        <app-select
          label="Estado"
          selectId="product-status"
          [formField]="form.status"
          [options]="statusOptions"
          testId="product-status-select"
        />
        <div class="actions">
          <button
            type="button"
            class="secondary"
            (click)="dialogRef.close(false)"
            [disabled]="form().submitting()"
            data-testid="product-form-cancel"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="primary"
            [disabled]="form().submitting()"
            data-testid="product-form-submit"
          >
            {{ form().submitting() ? 'Guardando…' : submitLabel() }}
          </button>
        </div>
      </form>
    </section>
  `,
})
export class ProductFormDialogComponent {
  protected readonly data = inject(APP_DIALOG_DATA) as ProductFormDialogData;
  protected readonly dialogRef = inject(AppDialogRef<boolean>);
  private readonly productsService = inject(ProductsService);

  private readonly operationError = signal('');
  protected readonly title = computed(() =>
    this.data.product ? 'Editar producto' : 'Nuevo producto',
  );
  protected readonly submitLabel = computed(() =>
    this.data.product ? 'Guardar cambios' : 'Crear producto',
  );
  protected readonly statusOptions: readonly SelectOption[] = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
    { value: 'DISCONTINUED', label: 'Descatalogado' },
  ];

  private readonly model = signal<ProductFormModel>(this.initialValue(this.data.product));
  protected readonly form = form(
    this.model,
    (path) => {
      required(path.name, { message: 'El nombre es obligatorio.' });
      minLength(path.name, 2, { message: 'El nombre debe tener al menos 2 caracteres.' });
      maxLength(path.name, 120, { message: 'El nombre no puede superar los 120 caracteres.' });
      maxLength(path.description, 1000, {
        message: 'La descripción no puede superar los 1000 caracteres.',
      });
      required(path.sku, { message: 'El SKU es obligatorio.' });
      pattern(path.sku, /^[A-Z0-9-]{3,32}$/, {
        message: 'El SKU debe contener de 3 a 32 mayúsculas, números o guiones.',
      });
      required(path.price, { message: 'El precio es obligatorio.' });
      min(path.price, 0, { message: 'El precio no puede ser negativo.' });
      required(path.stock, { message: 'El stock es obligatorio.' });
      min(path.stock, 0, { message: 'El stock no puede ser negativo.' });
      required(path.status, { message: 'Selecciona un estado.' });
    },
    {
      submission: {
        action: (fieldTree) => this.persistProduct(fieldTree),
        onInvalid: (fieldTree) => {
          focusBoundControl(fieldTree);
        },
      },
    },
  );

  protected readonly submitError = computed(
    () =>
      this.form()
        .errors()
        .find((error) => error.kind === 'invalidPayload')?.message ?? this.operationError(),
  );

  private async persistProduct(
    fieldTree: FieldTree<ProductFormModel>,
  ): Promise<TreeValidationResult> {
    this.operationError.set('');
    const value = fieldTree().value();
    const product: ProductInput = {
      name: value.name.trim(),
      description: value.description.trim() || null,
      sku: value.sku.trim(),
      price: value.price ?? 0,
      stock: value.stock ?? 0,
      status: value.status as ProductInput['status'],
    };
    const request = this.data.product
      ? this.productsService.replaceProduct(this.data.product.id, product)
      : this.productsService.createProduct(product);

    try {
      await firstValueFrom(request);
      this.dialogRef.close(true);
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 400) {
        return {
          kind: 'invalidPayload',
          message:
            'Los datos proporcionados no son válidos. Revisa los campos e inténtalo de nuevo.',
        };
      }

      this.operationError.set('No se han podido guardar los cambios. Inténtalo de nuevo.');
    }
  }

  private initialValue(product?: ProductOutput): ProductFormModel {
    return {
      name: product?.name ?? '',
      description: product?.description ?? '',
      sku: product?.sku ?? '',
      price: product?.price ?? null,
      stock: product?.stock ?? null,
      status: product?.status ?? 'ACTIVE',
    };
  }
}
