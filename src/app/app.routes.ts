import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Productos',
    loadComponent: () =>
      import('./features/products/products-page').then((component) => component.ProductsPage),
  },
  {
    path: 'demo',
    title: 'Demo de formularios',
    loadComponent: () =>
      import('./features/demo/demo-page').then((component) => component.DemoPage),
  },
  { path: '**', redirectTo: '' },
];
