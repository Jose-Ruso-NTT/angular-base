# Self-contained implementation pattern

This is the repository pattern in executable Angular terms. Replace only the domain names, generated API calls, validation rules, visible columns, and labels. Do not copy it as a new shared abstraction.

## List component: state and URL-backed filters

```ts
interface EntityFiltersModel {
  search: string;
  status: '' | EntityStatus;
}

type EntitySortBy = 'name' | 'status' | 'createdAt';

const ENTITY_SORT_BY = ['name', 'status', 'createdAt'] as const satisfies readonly EntitySortBy[];

private readonly filtersModel = signal<EntityFiltersModel>({ search: '', status: '' });
protected readonly filtersForm = form(
  this.filtersModel,
  (path) => {
    maxLength(path.search, 120, { message: 'La búsqueda no puede superar los 120 caracteres.' });
  },
  {
    submission: {
      action: () => this.urlState.applyFilters(),
      onInvalid: (fieldTree) => focusBoundControl(fieldTree),
    },
  },
);

protected readonly urlState = createUrlTableFormState<
  EntityFiltersModel,
  EntityFiltersModel,
  EntitySortBy
>({
  form: this.filtersForm,
  defaultFilters: () => ({ search: '', status: '' }),
  filters: {
    search: stringUrlParam(),
    status: mappedUrlParam([
      ['', 'all'],
      ['ACTIVE', 'active'],
      ['INACTIVE', 'inactive'],
    ]),
  },
  toUrlFilters: (value) => value,
  fromUrlState: (filters) => ({ ...filters }),
  table: {
    pageSizeOptions: [10, 25, 50],
    defaultPageSize: 10,
    sortByOptions: ENTITY_SORT_BY,
  },
});

protected readonly params = computed<ListEntitiesParams>(() => {
  const table = this.urlState.tableState();
  const filters = this.urlState.activeFilters();

  return {
    page: table.page,
    pageSize: table.pageSize,
    ...(table.sortBy === null ? {} : { sortBy: table.sortBy, sortDirection: table.sortDirection }),
    search: filters.search || undefined,
    status: filters.status || undefined,
  };
});

protected readonly entitiesResource = listEntitiesResource(this.params);
protected readonly entities = withPreviousValue(this.entitiesResource);
protected readonly columns: readonly DataTableColumn<Entity, EntitySortBy>[] = [
  { id: 'name', label: 'Nombre', sortable: true },
  { id: 'status', label: 'Estado', sortable: true },
  { id: 'createdAt', label: 'Creado', sortable: true },
  { id: 'actions', label: 'Acciones', align: 'right' },
];
protected readonly entityTrackBy = (entity: Entity) => entity.id;

protected clearFilters(): void {
  void this.urlState.resetFilters();
}
```

`Entity`, `EntityStatus`, `ListEntitiesParams` and `listEntitiesResource` are domain-specific generated API types. `form`, `maxLength`, `computed` and `signal` come from Angular; the URL-store and resource helpers come from `shared/`.

## List template: filters, status and table events

```html
<section class="filters" aria-labelledby="filters-title">
  <h2 id="filters-title">Filtrar entidades</h2>
  <form [formRoot]="filtersForm">
    <app-input
      label="Buscar"
      controlId="entity-search"
      type="search"
      [formField]="filtersForm.search"
      testId="entity-search"
    />
    <app-select
      label="Estado"
      controlId="entity-status"
      [formField]="filtersForm.status"
      [options]="statusOptions"
      testId="entity-status"
    />
    <div class="filter-actions">
      <button type="submit" class="primary" data-testid="entity-filter-submit">Aplicar filtros</button>
      <button type="button" class="secondary" (click)="clearFilters()" data-testid="entity-filter-clear">Limpiar</button>
    </div>
  </form>
</section>

@if (entities.error()) {
  <app-alert type="alert" message="No se han podido cargar las entidades.">
    <button type="button" class="secondary" (click)="entitiesResource.reload()">Reintentar</button>
  </app-alert>
}

<app-loading-overlay [loading]="entities.isLoading()" message="Cargando entidades…">
  @if (entities.hasValue()) {
    <app-data-table
      [rows]="entities.value().data"
      [columns]="columns"
      [sortBy]="urlState.tableState().sortBy"
      [sortDirection]="urlState.tableState().sortDirection"
      [rowTrackBy]="entityTrackBy"
      [pagination]="entities.value().pagination"
      [pageSizeOptions]="urlState.pageSizeOptions"
      [selectedPageSize]="urlState.tableState().pageSize"
      paginationTestId="entity"
      (sortChange)="urlState.setTableState({ kind: 'sort', sortBy: $event })"
      (pageChange)="urlState.setTableState({ kind: 'page', page: $event })"
      (pageSizeChange)="urlState.setTableState({ kind: 'pageSize', pageSize: $event })"
    >
      <ng-template appDataTableCellDef="actions" let-entity>
        <button type="button" class="primary" (click)="openForm(entity)" [attr.aria-label]="'Editar ' + entity.name">
          Editar
        </button>
      </ng-template>
    </app-data-table>
  }
</app-loading-overlay>
```

## Opening and saving a feature-local editor dialog

```ts
private readonly dialog = inject(AppDialogService);

protected openForm(entity?: Entity): void {
  this.dialog
    .open(EntityFormDialog, {
      data: { entity },
      ariaLabel: entity ? 'Editar entidad' : 'Nueva entidad',
    })
    .subscribe((saved) => {
      if (saved) this.entitiesResource.reload();
    });
}
```

Inside `EntityFormDialog`, inject `APP_DIALOG_DATA` and `AppDialogRef<boolean>`. Build a Signal Form from a local `signal` model, call `focusBoundControl` from the invalid-submit handler, send the generated API request in the submission action, call `dialogRef.close(true)` only after success, and surface a failed request in `AppAlert` without closing the dialog.
