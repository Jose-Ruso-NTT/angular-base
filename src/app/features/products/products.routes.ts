import type { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Productos',
    loadComponent: () =>
      import('./pages/products-page').then((component) => component.ProductsPage),
  },
];
