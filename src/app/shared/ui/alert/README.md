# Alertas

Usa `AppAlert` para mensajes persistentes de información, aviso o error. Requiere `type="info" | "warning" | "alert"`; `message` es opcional y puede proyectarse contenido para incluir una acción, por ejemplo reintentar una carga.

```html
<app-alert type="alert" message="No se han podido cargar los pedidos.">
  <button type="button" class="secondary" (click)="ordersResource.reload()">Reintentar</button>
</app-alert>
```

`info` usa el rol accesible `status`; `warning` y `alert`, el rol `alert`.
