import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Productos',
    loadComponent: () =>
      import('./features/products/products-page.component').then(
        (component) => component.ProductsPageComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
