import { Pipe, PipeTransform } from '@angular/core';
import type { ProductOutput } from '../../core/api/generated/schemas';
import type { StatusBadgeTone } from '../../shared/ui/status-badge/app-status-badge';

/** Product status appearances expressed with the semantic tones of shared UI. */
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
