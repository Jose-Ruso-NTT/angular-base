import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, maxLength, min, validate } from '@angular/forms/signals';
import { listProductsResource, ProductsService } from '../../core/api/generated';
import type { ListProductsParams, ProductOutput } from '../../core/api/generated/schemas';
import { AppInput } from '../../shared/ui/form-controls/app-input/app-input';
import { AppNumber } from '../../shared/ui/form-controls/app-number/app-number';
import { AppCheckbox } from '../../shared/ui/form-controls/app-checkbox/app-checkbox';
import { AppSelect, type SelectOption } from '../../shared/ui/form-controls/app-select/app-select';
import {
  AppDataTable,
  DataTableCellDefDirective,
  type DataTableColumn,
} from '../../shared/ui/data-table/data-table';
import { AppDialogService } from '../../shared/ui/dialog/app-dialog.service';
import { ConfirmDialog } from '../../shared/ui/dialog/confirm-dialog';
import { LoadingOverlay } from '../../shared/ui/loading-overlay/loading-overlay';
import { AppAlert } from '../../shared/ui/alert/app-alert';
import { focusBoundControl } from '../../shared/forms/focus-bound-control';
import {
  createUrlTableFormState,
  mappedUrlParam,
  nullableNumberUrlParam,
  stringUrlParam,
} from '../../shared/routing/url-table-form-state';
import { ProductFormDialog } from './product-form-dialog';
import { ProductStatusLabelPipe } from './product-status-label.pipe';
import { ProductStatusTonePipe } from './product-status-tone.pipe';
import { AppStatusBadge } from '../../shared/ui/status-badge/app-status-badge';
import { withPreviousValue } from '../../shared/resource/with-previous-value';

interface ProductFilters {
  readonly search?: string;
  readonly status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly inStock?: boolean;
}

type ProductStatusFilter = '' | ProductOutput['status'];

interface ProductFiltersModel {
  search: string;
  status: ProductStatusFilter;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
}

interface ProductUrlFilters {
  readonly search: string;
  readonly status: ProductStatusFilter;
  readonly minPrice: number | null;
  readonly maxPrice: number | null;
  readonly inStock: boolean;
}

const PRODUCT_SORT_BY = [
  'name',
  'price',
  'stock',
  'status',
  'createdAt',
] as const satisfies readonly NonNullable<ListProductsParams['sortBy']>[];

type ProductSortBy = (typeof PRODUCT_SORT_BY)[number];

/** Product catalogue page backed by the generated products API. */
@Component({
  selector: 'app-products-page',
  imports: [
    FormField,
    FormRoot,
    AppCheckbox,
    AppInput,
    AppNumber,
    AppSelect,
    AppDataTable,
    DataTableCellDefDirective,
    LoadingOverlay,
    AppAlert,
    CurrencyPipe,
    DatePipe,
    AppStatusBadge,
    ProductStatusLabelPipe,
    ProductStatusTonePipe,
  ],
  styleUrl: './products-page.css',
  templateUrl: './products-page.html',
})
export class ProductsPage {
  private readonly dialog = inject(AppDialogService);
  private readonly productsService = inject(ProductsService);

  protected readonly operationError = signal('');

  private readonly filtersModel = signal<ProductFiltersModel>(createProductFiltersDefaultValue());
  protected readonly filtersForm = form(
    this.filtersModel,
    (path) => {
      maxLength(path.search, 120, {
        message: 'La búsqueda no puede superar los 120 caracteres.',
      });
      min(path.minPrice, 0, { message: 'El precio mínimo no puede ser negativo.' });
      min(path.maxPrice, 0, { message: 'El precio máximo no puede ser negativo.' });
      validate(path.maxPrice, (context) => {
        const minPrice = context.valueOf(path.minPrice);
        const maxPrice = context.value();

        return minPrice !== null && maxPrice !== null && maxPrice < minPrice
          ? {
              kind: 'invalidPriceRange',
              message: 'El precio máximo no puede ser inferior al precio mínimo.',
            }
          : null;
      });
    },
    {
      submission: {
        action: async () => {
          await this.applyFilters();
        },
        onInvalid: (fieldTree) => {
          focusBoundControl(fieldTree);
        },
      },
    },
  );

  protected readonly urlState = createUrlTableFormState<
    ProductFiltersModel,
    ProductUrlFilters,
    ProductSortBy
  >({
    form: this.filtersForm,
    defaultFilters: createProductFiltersDefaultValue,
    filters: {
      search: stringUrlParam(),
      status: mappedUrlParam<ProductStatusFilter>([
        ['', 'all'],
        ['ACTIVE', 'active'],
        ['INACTIVE', 'inactive'],
        ['DISCONTINUED', 'discontinued'],
      ]),
      minPrice: nullableNumberUrlParam(),
      maxPrice: nullableNumberUrlParam(),
      inStock: mappedUrlParam<boolean>([
        [true, 'true'],
        [false, 'all'],
      ]),
    },
    toUrlFilters: (value) => ({
      search: value.search,
      status: value.status,
      minPrice: value.minPrice,
      maxPrice: value.maxPrice,
      inStock: value.inStock,
    }),
    fromUrlState: (filters) => ({ ...filters }),
    table: {
      pageSizeOptions: [10, 25, 50],
      defaultPageSize: 10,
      sortByOptions: PRODUCT_SORT_BY,
    },
  });

  protected readonly filterStatusOptions: readonly SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
    { value: 'DISCONTINUED', label: 'Descatalogado' },
  ];
  protected readonly columns: readonly DataTableColumn<ProductOutput, ProductSortBy>[] = [
    { id: 'name', label: 'Producto', sortable: true },
    { id: 'price', label: 'Precio', align: 'right', sortable: true },
    { id: 'stock', label: 'Stock', align: 'right', sortable: true },
    { id: 'status', label: 'Estado', sortable: true },
    { id: 'createdAt', label: 'Creado', sortable: true },
    { id: 'actions', label: 'Acciones', align: 'right' },
  ];

  protected readonly productTrackBy = (product: ProductOutput) => product.id;
  protected readonly params = computed<ListProductsParams>(() => {
    const table = this.urlState.tableState();
    return {
      page: table.page,
      pageSize: table.pageSize,
      ...(table.sortBy === null
        ? {}
        : { sortBy: table.sortBy, sortDirection: table.sortDirection }),
      ...toProductRequestFilters(this.urlState.activeFilters()),
    };
  });

  protected readonly productsResource = listProductsResource(this.params);
  protected readonly products = withPreviousValue(this.productsResource);

  private async applyFilters(): Promise<void> {
    this.operationError.set('');
    await this.urlState.applyFilters();
  }

  protected clearFilters(): void {
    this.operationError.set('');
    void this.urlState.resetFilters();
  }

  protected openProductForm(product?: ProductOutput): void {
    this.dialog
      .open(ProductFormDialog, {
        data: { product },
        ariaLabel: product ? 'Editar producto' : 'Nuevo producto',
      })
      .subscribe((saved) => {
        if (saved) this.productsResource.reload();
      });
  }

  protected confirmDelete(product: ProductOutput): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: 'Eliminar producto',
          message: `Vas a eliminar «${product.name}». Esta acción no se puede deshacer.`,
          confirmLabel: 'Eliminar',
        },
        ariaLabel: 'Confirmar eliminación',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.operationError.set('');
        this.productsService.deleteProduct(product.id).subscribe({
          next: () => {
            this.productsResource.reload();
          },
          error: () => {
            this.operationError.set('No se ha podido eliminar el producto. Inténtalo de nuevo.');
          },
        });
      });
  }
}

/** Produces an independent, empty filter value for initializing and resetting the form. */
function createProductFiltersDefaultValue(): ProductFiltersModel {
  return { search: '', status: '', minPrice: null, maxPrice: null, inStock: false };
}

/** Converts URL-backed form values into optional filters accepted by the products endpoint. */
function toProductRequestFilters(value: ProductFiltersModel): ProductFilters {
  return {
    search: value.search || undefined,
    status: value.status || undefined,
    minPrice: value.minPrice ?? undefined,
    maxPrice: value.maxPrice ?? undefined,
    inStock: value.inStock || undefined,
  };
}
