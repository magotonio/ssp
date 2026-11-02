import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'StackSSP',
    loadComponent: () => import('./home/home').then((module) => module.Home),
  },
];
