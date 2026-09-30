# Diálogos

Las funcionalidades no usan CDK Dialog directamente. Inyectan `AppDialogService`, reciben los datos con `APP_DIALOG_DATA` y cierran con `AppDialogRef<R>`.

`ariaLabel` es obligatorio: garantiza un nombre accesible para el contenedor aunque el contenido cambie.

```ts
this.dialog
  .open(OrderFormDialog, {
    data: { order },
    ariaLabel: order ? 'Editar pedido' : 'Nuevo pedido',
  })
  .subscribe((saved) => {
    if (saved) this.ordersResource.reload();
  });
```

Un diálogo de formulario pertenece a su funcionalidad, no a `shared/ui`. Debe incluir un título asociado por `aria-labelledby`, cancelar sin efectos, deshabilitar ambas acciones mientras guarda y mostrar los errores de petición sin cerrar ni descartar valores.

Para acciones destructivas abre `ConfirmDialog` mediante el servicio. La secuencia devuelve `true` al confirmar y `false` al cancelar.
