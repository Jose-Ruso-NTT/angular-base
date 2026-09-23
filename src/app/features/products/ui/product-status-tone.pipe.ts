import { Pipe, PipeTransform } from '@angular/core';
import type { ProductOutput } from '@core/api/generated/schemas';
import type { StatusBadgeTone } from '@shared/ui/status-badge/app-status-badge';

/** Feature-specific product status appearances expressed with shared UI tones. */
const PRODUCT_STATUS_BADGE_TONES: Readonly<Record<ProductOutput['status'], StatusBadgeTone>> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  DISCONTINUED: 'warning',
};

/** Converts a product status API value into a shared status-badge tone. */
@Pipe({ name: 'productStatusTone' })
export class ProductStatusTonePipe implements PipeTransform {
  transform(status: ProductOutput['status']): StatusBadgeTone {
    return PRODUCT_STATUS_BADGE_TONES[status];
  }
}
