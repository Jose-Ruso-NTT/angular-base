import { Component, signal } from '@angular/core';
import { listProductsResource } from './core/api/generated';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.css',
  template: `
    @if (products.isLoading()) {
      <p>Cargando productos…</p>
    } @else if (products.error()) {
      <p role="alert">No se han podido cargar los productos.</p>
    } @else if (products.hasValue()) {
      <p>{{ products.value().pagination.totalItems }} productos encontrados.</p>
    }
  `,
})
export class App {
  protected readonly title = signal('angular-base');

  protected readonly products = listProductsResource();
}
