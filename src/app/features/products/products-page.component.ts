import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, maxLength, min, validate } from '@angular/forms/signals';
import { listProductsResource, ProductsService } from '../../core/api/generated';
import type { ListProductsParams, ProductOutput } from '../../core/api/generated/schemas';
import { AppInputComponent } from '../../shared/ui/app-input/app-input.component';
import { AppCheckboxComponent } from '../../shared/ui/app-checkbox/app-checkbox.component';
import {
  AppSelectComponent,
  type SelectOption,
} from '../../shared/ui/app-select/app-select.component';
import {
  AppDataTableComponent,
  DataTableCellDefDirective,
  type DataTableColumn,
} from '../../shared/ui/data-table/data-table.component';
import { AppDialogService } from '../../shared/ui/dialog/app-dialog.service';
import { ConfirmDialogComponent } from '../../shared/ui/dialog/confirm-dialog.component';
import { focusBoundControl } from '../../shared/forms/focus-bound-control';
import {
  createUrlTableFormState,
  mappedUrlParam,
  nullableNumberUrlParam,
  stringUrlParam,
} from '../../shared/routing/url-table-form-state';
import { ProductFormDialogComponent } from './product-form-dialog.component';
import { ProductStatusLabelPipe } from './product-status-label.pipe';

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

/** Product catalogue page backed by the generated products API. */
@Component({
  selector: 'app-products-page',
  imports: [
    FormField,
    FormRoot,
    AppCheckboxComponent,
    AppInputComponent,
    AppSelectComponent,
    AppDataTableComponent,
    DataTableCellDefDirective,
    CurrencyPipe,
    DatePipe,
    ProductStatusLabelPipe,
  ],
  styleUrl: './products-page.component.css',
  template: `
    <main class="page" aria-labelledby="page-title">
      <header class="page-header">
        <div>
          <h1 id="page-title">Productos</h1>
          <p>Gestiona el catálogo y consulta su disponibilidad.</p>
        </div>
        <button
          type="button"
          class="primary"
          (click)="openProductForm()"
          data-testid="product-create-button"
        >
          Añadir producto
        </button>
      </header>

      <section class="filters" aria-labelledby="filters-title">
        <h2 id="filters-title">Filtrar productos</h2>
        <form [formRoot]="filtersForm">
          <app-input
            label="Buscar"
            inputId="product-search"
            type="search"
            [formField]="filtersForm.search"
            hint="Busca por nombre, SKU o descripción."
            testId="product-search-input"
          />
          <app-select
            label="Estado"
            selectId="filter-status"
            [formField]="filtersForm.status"
            [options]="filterStatusOptions"
            testId="product-status-filter"
          />
          <app-input
            label="Precio mínimo"
            inputId="min-price"
            type="number"
            [formField]="filtersForm.minPrice"
            [step]="0.01"
            testId="product-min-price-input"
          />
          <app-input
            label="Precio máximo"
            inputId="max-price"
            type="number"
            [formField]="filtersForm.maxPrice"
            [step]="0.01"
            testId="product-max-price-input"
          />
          <app-checkbox
            label="Solo con stock"
            [formField]="filtersForm.inStock"
            testId="product-in-stock-filter"
          />
          <div class="filter-actions">
            <button type="submit" class="primary" data-testid="product-filter-submit">
              Aplicar filtros
            </button>
            <button
              type="button"
              class="secondary"
              (click)="clearFilters()"
              data-testid="product-filter-clear"
            >
              Limpiar
            </button>
          </div>
        </form>
      </section>

      @if (operationError()) {
        <p class="alert" role="alert">{{ operationError() }}</p>
      }
      <section
        class="catalogue"
        aria-labelledby="catalogue-title"
        [attr.aria-busy]="products.isLoading() ? 'true' : 'false'"
      >
        <div class="catalogue-heading">
          <h2 id="catalogue-title">Listado</h2>
          @if (products.hasValue()) {
            <p aria-live="polite">
              {{ products.value().pagination.totalItems }} productos encontrados
            </p>
          }
        </div>
        @if (products.isLoading()) {
          <p class="loading" role="status">Cargando productos…</p>
        }
        @if (products.error()) {
          <div class="alert" role="alert">
            <p>No se han podido cargar los productos.</p>
            <button
              type="button"
              class="secondary"
              (click)="products.reload()"
              data-testid="product-retry-button"
            >
              Reintentar
            </button>
          </div>
        }
        @if (products.hasValue()) {
          <app-data-table
            [rows]="products.value().data"
            [columns]="columns"
            [sortBy]="urlState.tableState().sortBy"
            [sortDirection]="urlState.tableState().sortDirection"
            [rowTrackBy]="productTrackBy"
            [pagination]="products.value().pagination"
            [pageSizeOptions]="urlState.pageSizeOptions"
            [selectedPageSize]="urlState.tableState().pageSize"
            paginationTestId="product"
            emptyMessage="No hay productos que coincidan con los filtros."
            (sortChange)="urlState.setTableState({ kind: 'sort', sortBy: $event })"
            (pageChange)="urlState.setTableState({ kind: 'page', page: $event })"
            (pageSizeChange)="urlState.setTableState({ kind: 'pageSize', pageSize: $event })"
            data-testid="products-table"
          >
            <ng-template appDataTableCellDef="name" let-product>
              <strong>{{ product.name }}</strong>
              <small>{{ product.sku }}</small>
            </ng-template>
            <ng-template appDataTableCellDef="price" let-product>
              {{ product.price | currency: 'EUR' : 'symbol' : '1.2-2' }}
            </ng-template>
            <ng-template appDataTableCellDef="status" let-product>
              <span
                class="status"
                [class.active]="product.status === 'ACTIVE'"
                [class.inactive]="product.status === 'INACTIVE'"
                [class.discontinued]="product.status === 'DISCONTINUED'"
                >{{ product.status | productStatusLabel }}</span
              >
            </ng-template>
            <ng-template appDataTableCellDef="createdAt" let-product>
              {{ product.createdAt | date: 'dd/MM/yyyy HH:mm' }}
            </ng-template>
            <ng-template appDataTableCellDef="actions" let-product>
              <div class="row-actions">
                <button
                  type="button"
                  class="link-button"
                  (click)="openProductForm(product)"
                  [attr.aria-label]="'Editar ' + product.name"
                  [attr.data-testid]="'product-edit-' + product.id"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="link-button danger-text"
                  (click)="confirmDelete(product)"
                  [attr.aria-label]="'Eliminar ' + product.name"
                  [attr.data-testid]="'product-delete-' + product.id"
                >
                  Eliminar
                </button>
              </div>
            </ng-template>
          </app-data-table>
        }
      </section>
    </main>
  `,
})
export class ProductsPageComponent {
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
    (typeof PRODUCT_SORT_BY)[number]
  >({
    namespace: 'products',
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

  protected readonly columns: readonly DataTableColumn<ProductOutput>[] = [
    { id: 'name', label: 'Producto', sortable: true },
    { id: 'price', label: 'Precio', sortable: true },
    { id: 'stock', label: 'Stock', sortable: true },
    { id: 'status', label: 'Estado', sortable: true },
    { id: 'createdAt', label: 'Creado', sortable: true },
    { id: 'actions', label: 'Acciones' },
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

  protected readonly products = listProductsResource(this.params);

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
      .open(ProductFormDialogComponent, {
        data: { product },
        ariaLabel: product ? 'Editar producto' : 'Nuevo producto',
      })
      .subscribe((saved) => {
        if (saved) this.products.reload();
      });
  }

  protected confirmDelete(product: ProductOutput): void {
    this.dialog
      .open(ConfirmDialogComponent, {
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
            this.products.reload();
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
