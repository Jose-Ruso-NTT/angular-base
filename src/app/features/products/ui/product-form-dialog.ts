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
  validate,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { ProductsService } from '@core/api/generated';
import type { ProductInput, ProductOutput } from '@core/api/generated/schemas';
import { AppInput } from '@shared/ui/form-controls/app-input/app-input';
import { AppNumber } from '@shared/ui/form-controls/app-number/app-number';
import { AppSelect, type SelectOption } from '@shared/ui/form-controls/app-select/app-select';
import { APP_DIALOG_DATA, AppDialogRef } from '@shared/ui/dialog/app-dialog.service';
import { focusBoundControl } from '@shared/forms/focus-bound-control';
import { integer } from '@shared/forms/integer.validator';
import { AppAlert } from '@shared/ui/alert/app-alert';

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

/** Feature-local product creation and editing form displayed through the dialog wrapper. */
@Component({
  selector: 'app-product-form-dialog',
  imports: [FormField, FormRoot, AppInput, AppNumber, AppSelect, AppAlert],
  styleUrl: './product-form-dialog.css',
  templateUrl: './product-form-dialog.html',
})
export class ProductFormDialog {
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
      validate(path.stock, integer('El stock debe ser un número entero.'));
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
