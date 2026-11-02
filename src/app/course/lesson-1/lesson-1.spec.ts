import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course-progress.service';
import { Lesson1 } from './lesson-1';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Lección 1 del curso SSP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    clearCourseCookies(TestBed.inject(DOCUMENT));
  });

  afterEach(() => {
    clearCourseCookies(TestBed.inject(DOCUMENT));
  });

  it('guarda la cookie de progreso al entrar y renderiza los 52 puntos en círculo con leyenda de 4 colores', async () => {
    const doc = TestBed.inject(DOCUMENT);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/curso/leccion-1', Lesson1);
    const page = harness.routeNativeElement;

    expect(doc.cookie).toContain(`${CURRENT_LESSON_COOKIE}=leccion-1`);
    expect(page?.querySelector('h1')?.textContent).toContain('Introducción a la ordenación SSP');
    expect(page?.querySelectorAll('.slot-group')).toHaveLength(52);
    expect(page?.querySelectorAll('.suit-pill')).toHaveLength(4);
  });

  it('permite repartir las 52 cartas y hacer clic en un punto para ver qué carta es', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/curso/leccion-1', Lesson1);
    const page = harness.routeNativeElement;

    const fillButton = Array.from(page?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
      (btn) => btn.textContent?.includes('Ver las 52 cartas'),
    );
    expect(fillButton).toBeTruthy();
    fillButton?.click();
    harness.detectChanges();

    // Tras completar las 52 cartas, se señala el 9 de Picas (posición 1 en SSP)
    expect(page?.querySelector('.inspector-card-name')?.textContent).toBe('9 de Picas');
    expect(page?.querySelector('.inspector-ssp-pos')?.textContent).toContain('Posición 1 en SSP');

    // Al hacer clic en el primer punto (las 12 en punto, hueco 0), muestra el As de Picas
    const slots = page?.querySelectorAll<SVGGElement>('.slot-group');
    slots?.[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    harness.detectChanges();

    expect(page?.querySelector('.inspector-card-name')?.textContent).toBe('As de Picas');
    expect(page?.querySelector('.inspector-ssp-pos')?.textContent).toContain('Posición 29 en SSP');
  });

  it('permite completar la lección y persiste el estado completado en cookies', async () => {
    const doc = TestBed.inject(DOCUMENT);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/curso/leccion-1', Lesson1);
    const page = harness.routeNativeElement;

    const completeBtn = Array.from(page?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
      (btn) => btn.textContent?.includes('Completar Lección 1'),
    );
    expect(completeBtn).toBeTruthy();
    completeBtn?.click();
    harness.detectChanges();

    expect(doc.cookie).toContain(`${COMPLETED_LESSONS_COOKIE}=leccion-1`);
    expect(page?.textContent).toContain('Lección 1 completada');
  });
});

