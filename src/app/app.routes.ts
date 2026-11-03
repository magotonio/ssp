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
    path: 'curso/leccion-3',
    title: 'Lección 3 · El orden de los palos | StackSSP',
    loadComponent: () =>
      import('./course/lesson3/lesson3').then((module) => module.Lesson3),
  },
  {
    path: 'curso/leccion-4',
    title: 'Lección 4 · Integración de índice y palo | StackSSP',
    loadComponent: () =>
      import('./course/lesson4/lesson4').then((module) => module.Lesson4),
  },
  {
    path: 'curso/leccion-5',
    title: 'Lección 5 · Los cuatro reinos de la baraja | StackSSP',
    loadComponent: () =>
      import('./course/lesson5/lesson5').then((module) => module.Lesson5),
  },
  {
    path: 'curso/leccion-6',
    title: 'Lección 6 · Posición interna en cada reino | StackSSP',
    loadComponent: () =>
      import('./course/lesson6/lesson6').then((module) => module.Lesson6),
  },
  {
    path: 'curso/leccion-7',
    title: 'Lección 7 · Integración y localización al tacto | StackSSP',
    loadComponent: () =>
      import('./course/lesson7/lesson7').then((module) => module.Lesson7),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
