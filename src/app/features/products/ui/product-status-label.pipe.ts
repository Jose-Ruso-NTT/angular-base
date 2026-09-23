import { Pipe, PipeTransform } from '@angular/core';
import type { ProductOutput } from '@core/api/generated/schemas';

/** Feature-specific Spanish labels for the product statuses exposed by the API. */
export const PRODUCT_STATUS_LABELS: Readonly<Record<ProductOutput['status'], string>> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  DISCONTINUED: 'Descatalogado',
};

/** Converts a product status API value into its user-facing Spanish label. */
@Pipe({ name: 'productStatusLabel' })
export class ProductStatusLabelPipe implements PipeTransform {
  transform(status: ProductOutput['status']): string {
    return PRODUCT_STATUS_LABELS[status];
  }
}
