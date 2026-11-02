import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { CourseProgressService } from './course/course-progress.service';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'StackSSP',
    loadComponent: () => import('./home/home').then((module) => module.Home),
  },
  {
    path: 'curso',
    pathMatch: 'full',
    redirectTo: () => inject(CourseProgressService).targetCourseRoute(),
  },
  {
    path: 'curso/introduccion',
    title: 'Introducción · Ordenación SSP | StackSSP',
    loadComponent: () =>
      import('./course/introduction/introduction').then((module) => module.Introduction),
  },
  {
    path: 'curso/leccion-1',
    pathMatch: 'full',
    redirectTo: 'curso/introduccion',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
