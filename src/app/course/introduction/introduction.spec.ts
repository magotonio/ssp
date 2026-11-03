import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course-progress.service';
import { Introduction } from './introduction';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Introducción del curso SSP', () => {
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
    await harness.navigateByUrl('/curso/introduccion', Introduction);
    const page = harness.routeNativeElement;

    expect(doc.cookie).toContain(`${CURRENT_LESSON_COOKIE}=introduccion`);
    expect(page?.querySelector('header')?.textContent).toContain('Introducción');
    expect(page?.querySelector('h1')?.textContent).toContain('Introducción a la ordenación SSP');
    expect(page?.querySelectorAll('.slot-group')).toHaveLength(52);
    expect(page?.querySelectorAll('.suit-pill')).toHaveLength(4);
  });

  it('ofrece enlace directo hacia /curso/leccion-1 desde el cierre de la introducción', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/curso/introduccion', Introduction);
    const page = harness.routeNativeElement;

    const lesson1Link = Array.from(page?.querySelectorAll<HTMLAnchorElement>('a') ?? []).find(
      (link) => link.textContent?.includes('Ir a la Lección 1'),
    );
    expect(lesson1Link).toBeTruthy();
    expect(lesson1Link?.getAttribute('href')).toBe('/curso/leccion-1');
  });

  it('permite repartir las 52 cartas y hacer clic en un punto para ver qué carta es', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/curso/introduccion', Introduction);
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

  it('permite completar la introducción, prepara el paso a la Lección 1 y persiste el estado en cookies', async () => {
    const doc = TestBed.inject(DOCUMENT);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/curso/introduccion', Introduction);
    const page = harness.routeNativeElement;

    expect(page?.textContent).toContain('PREPARACIÓN PARA LA LECCIÓN 1');

    const completeBtn = Array.from(page?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
      (btn) => btn.textContent?.includes('Completar Introducción'),
    );
    expect(completeBtn).toBeTruthy();
    completeBtn?.click();
    harness.detectChanges();

    expect(doc.cookie).toContain(`${COMPLETED_LESSONS_COOKIE}=introduccion`);
    expect(page?.textContent).toContain('Introducción completada');
    expect(page?.textContent).toContain('Continúa con la Lección 1 para montar tu baraja física.');
  });
});
