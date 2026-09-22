import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Productos',
    loadComponent: () =>
      import('./features/products/products-page').then((component) => component.ProductsPage),
  },
  { path: '**', redirectTo: '' },
];
