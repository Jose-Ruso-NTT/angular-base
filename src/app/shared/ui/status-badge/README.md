# Badge de estado

`AppStatusBadge` muestra una clasificación compacta. Requiere texto (`label`) y tono semántico (`tone`): `success`, `neutral`, `warning`, `danger` o `info`.

```html
<app-status-badge
  [label]="order.status | orderStatusLabel"
  [tone]="order.status | orderStatusTone"
/>
```

Convierte los estados de negocio a tono mediante una pipe o función de la funcionalidad; no añadas esa lógica al componente compartido.
