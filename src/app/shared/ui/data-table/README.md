# Tabla de datos

`AppDataTable` muestra filas, ordenación y paginación. La funcionalidad propietaria conserva el estado, realiza la petición de datos y responde a los eventos de la tabla.

## Uso obligatorio

- Pasa `rows`, `columns` tipadas y `rowTrackBy` estable.
- Una columna ordenable debe declarar `sortable: true`; `sortChange` entrega su `id`.
- Para fechas, badges, acciones o cualquier valor no escalar, usa `<ng-template appDataTableCellDef="id" let-row>`.
- Si existe paginación, pasa `pagination`, `pageSizeOptions` y `selectedPageSize`; redirige `pageChange` y `pageSizeChange` al estado de la pantalla.
- En listas filtrables usa `createUrlTableFormState`. Mantiene filtros aplicados, página, tamaño y orden en la URL.

```ts
readonly columns: readonly DataTableColumn<Order, OrderSort>[] = [
  { id: 'number', label: 'Pedido', sortable: true },
  { id: 'total', label: 'Total', align: 'right', sortable: true },
  { id: 'actions', label: 'Acciones', align: 'right' },
];
readonly orderTrackBy = (order: Order) => order.id;
```

```html
<app-data-table
  [rows]="orders.value().data"
  [columns]="columns"
  [rowTrackBy]="orderTrackBy"
  [pagination]="orders.value().pagination"
  (sortChange)="urlState.setTableState({ kind: 'sort', sortBy: $event })"
  (pageChange)="urlState.setTableState({ kind: 'page', page: $event })"
  (pageSizeChange)="urlState.setTableState({ kind: 'pageSize', pageSize: $event })"
>
  <ng-template appDataTableCellDef="actions" let-order>…</ng-template>
</app-data-table>
```
