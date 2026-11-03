import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { getNextSuit, SUIT_CYCLE } from '../../ssp/ssp-stack';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course-progress.service';
import { Lesson2 } from '../lesson2/lesson2';
import { Lesson3 } from './lesson3';
import { SuitOrderTrainer } from './suit-order-trainer';
import { SuitPointsDiagram } from './suit-points-diagram';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Lección 3 · El orden de los palos, diagrama de puntas y entrenador', () => {
  describe('Ciclo normativo de palos', () => {
    it('recorre P -> C -> T -> D -> P (+1) y salta a palos gemelos (+2)', () => {
      expect(SUIT_CYCLE).toEqual(['P', 'C', 'T', 'D']);

      expect(getNextSuit('P', 1)).toBe('C');
      expect(getNextSuit('C', 1)).toBe('T');
      expect(getNextSuit('T', 1)).toBe('D');
      expect(getNextSuit('D', 1)).toBe('P');

      expect(getNextSuit('P', 2)).toBe('T');
      expect(getNextSuit('C', 2)).toBe('D');
      expect(getNextSuit('T', 2)).toBe('P');
      expect(getNextSuit('D', 2)).toBe('C');
    });
  });

  describe('Pantalla interactiva Lesson3 (/curso/leccion-3)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    afterEach(() => {
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    it('guarda ssp_current_lesson=leccion-3 y muestra el diagrama gráfico con 1, 2, 3 y 4 puntas/sobresalientes', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-3', Lesson3);
      const page = harness.routeNativeElement;

      expect(doc.cookie).toContain(`${CURRENT_LESSON_COOKIE}=leccion-3`);
      expect(page?.querySelector('header')?.textContent).toContain('Lección 3');
      expect(page?.querySelector('h1')?.textContent).toContain('La secuencia canónica de los palos');
      expect(page?.textContent).toContain('PICOTRIDIA');
      expect(page?.textContent).toContain('PI-CO-TU-DO');

      // Verifica que los 4 palos tienen 1, 2, 3 y 4 marcadores gráficos de puntas/sobresalientes
      const cardP = page?.querySelector('.anatomy-card[data-suit="P"]');
      const cardC = page?.querySelector('.anatomy-card[data-suit="C"]');
      const cardT = page?.querySelector('.anatomy-card[data-suit="T"]');
      const cardD = page?.querySelector('.anatomy-card[data-suit="D"]');

      expect(cardP?.querySelectorAll('.point-callout')).toHaveLength(1);
      expect(cardC?.querySelectorAll('.point-callout')).toHaveLength(2);
      expect(cardT?.querySelectorAll('.point-callout')).toHaveLength(3);
      expect(cardD?.querySelectorAll('.point-callout')).toHaveLength(4);
    });

    it('permite inspeccionar cualquier palo en el diagrama y ocultar/mostrar los marcadores', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-3', Lesson3);
      const page = harness.routeNativeElement;

      const diagramDebug = harness.fixture.debugElement.query(By.directive(SuitPointsDiagram));
      expect(diagramDebug).toBeTruthy();

      const cardT = page?.querySelector<HTMLButtonElement>('.anatomy-card[data-suit="T"]');
      cardT?.click();
      harness.detectChanges();

      const inspectorText = page?.querySelector('[data-testid="suit-anatomy-inspector"]')?.textContent;
      expect(inspectorText).toContain('3. Tréboles');
      expect(inspectorText).toContain('3 hojas sobresalientes');
      expect(inspectorText).toContain('Diamantes');
      expect(inspectorText).toContain('Picas');

      const toggleBtn = page?.querySelector<HTMLButtonElement>('.toggle-markers-btn');
      toggleBtn?.click();
      harness.detectChanges();
      expect(page?.querySelectorAll('.point-callout')).toHaveLength(0);

      toggleBtn?.click();
      harness.detectChanges();
      expect(page?.querySelectorAll('.point-callout')).toHaveLength(10);
    });

    it('redirige /curso a /curso/leccion-3 cuando el usuario se quedó en la Lección 3', async () => {
      const doc = TestBed.inject(DOCUMENT);
      doc.cookie = `${CURRENT_LESSON_COOKIE}=leccion-3; path=/`;

      const router = TestBed.inject(Router);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso', Lesson3);

      expect(router.url).toBe('/curso/leccion-3');
    });

    it('cuenta fallos y aciertos en los modos del entrenador de palos y resetea el marcador', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-3', Lesson3);
      const page = harness.routeNativeElement;

      const trainerDebug = harness.fixture.debugElement.query(By.directive(SuitOrderTrainer));
      expect(trainerDebug).toBeTruthy();
      const trainer = trainerDebug.componentInstance as SuitOrderTrainer;

      // Modo siguiente palo (+1): fijamos Tréboles ('T') -> respuesta correcta Diamantes ('D')
      trainer.setPromptForTesting('next', { suit: 'T', step: 1, targetOrder: 3 });
      harness.detectChanges();

      const btnP = page?.querySelector<HTMLButtonElement>('.suit-choice-btn[data-suit="P"]');
      btnP?.click();
      harness.detectChanges();

      expect(trainer.misses()).toBe(1);
      expect(trainer.hits()).toBe(0);
      expect(page?.querySelector('[data-testid="suit-trainer-misses"]')?.textContent).toContain('1');
      expect(trainer.prompt().suit).toBe('T');

      const btnD = page?.querySelector<HTMLButtonElement>('.suit-choice-btn[data-suit="D"]');
      btnD?.click();
      harness.detectChanges();

      expect(trainer.hits()).toBe(1);
      expect(trainer.misses()).toBe(1);
      expect(trainer.prompt().suit).not.toBe('T');

      // Modo por número de puntas (1-4): fijamos 2 sobresalientes -> respuesta correcta Corazones ('C')
      trainer.setPromptForTesting('points', { suit: 'C', step: 1, targetOrder: 2 });
      harness.detectChanges();

      const btnC = page?.querySelector<HTMLButtonElement>('.suit-choice-btn[data-suit="C"]');
      btnC?.click();
      harness.detectChanges();
      expect(trainer.hits()).toBe(2);

      // Resetear contador
      const resetBtn = page?.querySelector<HTMLButtonElement>('[data-testid="suit-trainer-reset"]');
      resetBtn?.click();
      harness.detectChanges();

      expect(trainer.hits()).toBe(0);
      expect(trainer.misses()).toBe(0);
    });

    it('marca la Lección 3 como completada y enlaza desde la Lección 2 hacia /curso/leccion-3', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();

      await harness.navigateByUrl('/curso/leccion-2', Lesson2);
      const lesson2Page = harness.routeNativeElement;
      const linkToLesson3 = Array.from(
        lesson2Page?.querySelectorAll<HTMLAnchorElement>('a') ?? [],
      ).find((link) => link.textContent?.includes('Ir a la Lección 3'));
      expect(linkToLesson3).toBeTruthy();
      expect(linkToLesson3?.getAttribute('href')).toBe('/curso/leccion-3');

      await harness.navigateByUrl('/curso/leccion-3', Lesson3);
      const lesson3Page = harness.routeNativeElement;
      const completeBtn = Array.from(
        lesson3Page?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((btn) => btn.textContent?.includes('Completar Lección 3'));
      expect(completeBtn).toBeTruthy();
      completeBtn?.click();
      harness.detectChanges();

      expect(doc.cookie).toContain(`${COMPLETED_LESSONS_COOKIE}=leccion-3`);
      expect(lesson3Page?.textContent).toContain('Lección 3 completada');
    });
  });
});

