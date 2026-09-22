# Carga superpuesta

`LoadingOverlay` mantiene el contenido proyectado y coloca una capa de carga sobre él. Úsalo alrededor de tablas o bloques que ya tienen datos para evitar parpadeos durante una recarga.

```html
<app-loading-overlay [loading]="orders.isLoading()" message="Cargando pedidos…">
  <!-- contenido que conserva su posición mientras carga -->
</app-loading-overlay>
```

La propiedad `loading` predetermina a `false` y `message` a `Cargando…`.
