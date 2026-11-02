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
    path: 'curso/leccion-1',
    title: 'Lección 1 · Introducción a la SSP | StackSSP',
    loadComponent: () =>
      import('./course/lesson-1/lesson-1').then((module) => module.Lesson1),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
