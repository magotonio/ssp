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
    title: 'Lección 1 · Montaje de la baraja | StackSSP',
    loadComponent: () =>
      import('./course/lesson1/lesson1').then((module) => module.Lesson1),
  },
  {
    path: 'curso/leccion-2',
    title: 'Lección 2 · Cálculo del siguiente índice | StackSSP',
    loadComponent: () =>
      import('./course/lesson2/lesson2').then((module) => module.Lesson2),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
