import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  output,
} from '@angular/core';

/** Definition for a visible column in AppDataTable. */
export type DataTableColumn<T, TSortableId extends string = string> =
  SortableDataTableColumn<T, TSortableId> | NonSortableDataTableColumn<T>;

interface BaseDataTableColumn<T> {
  /** Text displayed in the table header. */
  readonly label: string;
  /** Horizontal alignment shared by the header and cells in this column. */
  readonly align?: 'left' | 'center' | 'right';
  /** Optional text transformer. Without it, the table renders the row property matching `id`. */
  readonly render?: (row: T) => string;
}

interface SortableDataTableColumn<T, TSortableId extends string> extends BaseDataTableColumn<T> {
  /** Unique column identifier, also used to match an optional cell template. */
  readonly id: TSortableId;
  /** Allows the user to request server-side sorting on this field. */
  readonly sortable: true;
}

interface NonSortableDataTableColumn<T> extends BaseDataTableColumn<T> {
  /** Unique column identifier, also used to match an optional cell template. */
  readonly id: string;
  /** This column cannot be used to request sorting. */
  readonly sortable?: false;
}

/** Server or client pagination state rendered below a data table. */
export interface DataTablePagination {
  /** Current one-based page number. */
  readonly page: number;
  /** Number of rows displayed per page. */
  readonly pageSize: number;
  /** Total number of available pages. */
  readonly totalPages: number;
  /** Whether a previous page can be requested. */
  readonly hasPreviousPage: boolean;
  /** Whether a next page can be requested. */
  readonly hasNextPage: boolean;
}

/** Supplies a custom table-cell template for a column. */
@Directive({ selector: 'ng-template[appDataTableCellDef]' })
export class DataTableCellDefDirective<T> {
  /** Identifier of the column rendered by this template. */
  readonly appDataTableCellDef = input.required<string>();
  readonly template = inject<TemplateRef<{ $implicit: T; row: T }>>(TemplateRef);
}

/** Generic semantic data table with configurable columns and cell templates. */
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet],
  styleUrl: './data-table.css',
  templateUrl: './data-table.html',
})
export class AppDataTable<T, TSortableId extends string = string> {
  /** Rows rendered in the table body. */
  readonly rows = input.required<readonly T[]>();
  /** Ordered definitions for the visible columns. */
  readonly columns = input.required<readonly DataTableColumn<T, TSortableId>[]>();
  /** Accessible message displayed if rows is empty. */
  readonly emptyMessage = input('No hay resultados.');
  /** Current server-side sort field. */
  readonly sortBy = input<TSortableId | null>(null);
  /** Current sort direction. */
  readonly sortDirection = input<'asc' | 'desc' | null>(null);
  /** Stable key generator for rendering rows. */
  readonly rowTrackBy = input.required<(row: T) => string | number>();
  /** Emits a column id after the user requests a sort change. */
  readonly sortChange = output<TSortableId>();
  /** Optional pagination state. The owning feature remains responsible for loading data. */
  readonly pagination = input<DataTablePagination | null>(null);
  /** Page-size choices available to the user. */
  readonly pageSizeOptions = input<readonly number[]>([10, 25, 50]);
  /** Current requested page size. Defaults to the value reported by the data source. */
  readonly selectedPageSize = input<number | null>(null);
  /** Accessible navigation label for the pagination controls. */
  readonly paginationLabel = input('Paginación');
  /** Label displayed next to the page-size selector. */
  readonly pageSizeLabel = input('Resultados por página');
  /** Prefix used for stable automated-test selectors. */
  readonly paginationTestId = input('data-table');
  /** Emits a requested one-based page number. */
  readonly pageChange = output<number>();
  /** Emits a requested page size. */
  readonly pageSizeChange = output<number>();

  private readonly cellDefs = contentChildren(DataTableCellDefDirective<T>);

  /** Identifier shared by the page-size label and selector. */
  protected readonly pageSizeId = computed(() => `${this.paginationTestId()}-page-size`);
  /** Stable selector for the page-size control. */
  protected readonly pageSizeTestId = computed(() => `${this.paginationTestId()}-page-size`);
  /** Stable selector for the previous-page button. */
  protected readonly previousPageTestId = computed(
    () => `${this.paginationTestId()}-previous-page`,
  );
  /** Stable selector for the next-page button. */
  protected readonly nextPageTestId = computed(() => `${this.paginationTestId()}-next-page`);

  protected cellTemplate(id: string): TemplateRef<{ $implicit: T; row: T }> | undefined {
    return this.cellDefs().find((definition) => definition.appDataTableCellDef() === id)?.template;
  }

  /** Converts a scalar row property into fallback cell text. Complex values need a template or renderer. */
  protected cellValue(row: T, column: DataTableColumn<T, TSortableId>): string {
    const value = (row as Record<string, unknown>)[column.id];
    return typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
      ? String(value)
      : '';
  }

  /** Validates and forwards a user-selected page size. */
  protected onPageSizeChange(value: string): void {
    const pageSize = Number(value);
    if (Number.isInteger(pageSize) && pageSize > 0) this.pageSizeChange.emit(pageSize);
  }

  protected ariaSort(
    column: DataTableColumn<T, TSortableId>,
  ): 'ascending' | 'descending' | 'none' | null {
    if (!column.sortable || this.sortBy() !== column.id || this.sortDirection() === null) {
      return null;
    }
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  protected sortIndicator(column: DataTableColumn<T, TSortableId>): string {
    if (this.sortBy() !== column.id) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  protected sortLabel(column: DataTableColumn<T, TSortableId>): string {
    if (this.sortBy() === column.id && this.sortDirection() === 'desc') {
      return `Quitar la ordenación por ${column.label}`;
    }
    const nextDirection =
      this.sortBy() === column.id && this.sortDirection() === 'asc' ? 'descendente' : 'ascendente';
    return `Ordenar por ${column.label} de forma ${nextDirection}`;
  }
}
