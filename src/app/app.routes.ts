import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/products/products.routes').then((routes) => routes.PRODUCTS_ROUTES),
  },
  {
    path: 'demo',
    title: 'Demo de formularios',
    loadComponent: () =>
      import('./features/demo/demo-page').then((component) => component.DemoPage),
  },
  { path: '**', redirectTo: '' },
];
