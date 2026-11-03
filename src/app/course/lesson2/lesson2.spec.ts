import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import {
  CARD_RANK_BY_VALUE,
  CARD_RANKS,
  getNextCardValue,
  SSP_VALUE_CYCLE,
} from '../../ssp/ssp-stack';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course-progress.service';
import { Lesson2 } from './lesson2';
import { NextIndexTrainer } from './next-index-trainer';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Lección 2 · Cálculo del siguiente índice y entrenador', () => {
  describe('Cálculo normativo del siguiente índice', () => {
    it('recorre los 13 índices en el orden SSP sin repetición y cierra en 9', () => {
      expect(SSP_VALUE_CYCLE).toEqual([9, 5, 1, 10, 6, 2, 11, 7, 3, 12, 8, 4, 13]);
      expect(new Set(SSP_VALUE_CYCLE).size).toBe(13);
      expect(getNextCardValue(13)).toBe(9);
      expect(getNextCardValue(1)).toBe(10);
      expect(getNextCardValue(2)).toBe(11);
      expect(getNextCardValue(3)).toBe(12);
      expect(getNextCardValue(4)).toBe(13);
    });
  });

  describe('Pantalla interactiva Lesson2 (/curso/leccion-2)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    afterEach(() => {
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    it('guarda la cookie ssp_current_lesson=leccion-2 y explica el cálculo del siguiente índice', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-2', Lesson2);
      const page = harness.routeNativeElement;

      expect(doc.cookie).toContain(`${CURRENT_LESSON_COOKIE}=leccion-2`);
      expect(page?.querySelector('header')?.textContent).toContain('Lección 2');
      expect(page?.querySelector('h1')?.textContent).toContain(
        'Cómo calcular el siguiente índice',
      );
      expect(page?.textContent).toContain('Regla general: resta 4');
      expect(page?.textContent).toContain('Valores bajos: suma 9');
      expect(page?.querySelectorAll('.cycle-node-btn')).toHaveLength(13);
    });

    it('redirige /curso a /curso/leccion-2 cuando el usuario se quedó en la Lección 2', async () => {
      const doc = TestBed.inject(DOCUMENT);
      doc.cookie = `${CURRENT_LESSON_COOKIE}=leccion-2; path=/`;

      const router = TestBed.inject(Router);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso', Lesson2);

      expect(router.url).toBe('/curso/leccion-2');
    });

    it('cuenta fallos y aciertos en el entrenador, cambia de índice al acertar y permite resetear el contador', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-2', Lesson2);
      const page = harness.routeNativeElement;

      const trainerDebug = harness.fixture.debugElement.query(By.directive(NextIndexTrainer));
      expect(trainerDebug).toBeTruthy();
      const trainer = trainerDebug.componentInstance as NextIndexTrainer;

      // Mostrar un índice válido al azar entre los 13 índices (A..K)
      const validRanks = CARD_RANKS.map((r) => r.rank);
      const initialRank = page
        ?.querySelector('[data-testid="trainer-prompt-rank"] .prompt-rank-main')
        ?.textContent?.trim();
      expect(validRanks).toContain(initialRank);
      expect(page?.querySelectorAll('.index-choice-btn')).toHaveLength(13);

      // Fijamos el índice actual en 2 (siguiente correcto: J, valor 11)
      trainer.setPromptForTesting(2);
      harness.detectChanges();
      expect(
        page
          ?.querySelector('[data-testid="trainer-prompt-rank"] .prompt-rank-main')
          ?.textContent?.trim(),
      ).toBe('2');

      // Pulsamos una opción errónea (6) -> suma 1 fallo y mantiene el índice 2 para reintentar
      const btn6 = page?.querySelector<HTMLButtonElement>('.index-choice-btn[data-rank="6"]');
      expect(btn6).toBeTruthy();
      btn6?.click();
      harness.detectChanges();

      expect(trainer.misses()).toBe(1);
      expect(trainer.hits()).toBe(0);
      expect(page?.querySelector('[data-testid="trainer-misses"]')?.textContent).toContain('1');
      expect(page?.querySelector('.feedback-box')?.textContent).toContain('¡Fallo!');
      expect(trainer.currentValue()).toBe(2);

      // Pulsamos la opción correcta (J) -> suma 1 acierto y pasa a otro índice aleatorio distinto
      const btnJ = page?.querySelector<HTMLButtonElement>('.index-choice-btn[data-rank="J"]');
      expect(btnJ).toBeTruthy();
      btnJ?.click();
      harness.detectChanges();

      expect(trainer.hits()).toBe(1);
      expect(trainer.misses()).toBe(1);
      expect(page?.querySelector('[data-testid="trainer-hits"]')?.textContent).toContain('1');
      expect(page?.querySelector('.feedback-box')?.textContent).toContain('¡Acierto!');
      expect(trainer.currentValue()).not.toBe(2);

      // Acertamos una vez más dinámicamente sobre el nuevo índice aleatorio
      const nextExpectedRank = CARD_RANK_BY_VALUE[getNextCardValue(trainer.currentValue())].rank;
      const nextRightBtn = page?.querySelector<HTMLButtonElement>(
        `.index-choice-btn[data-rank="${nextExpectedRank}"]`,
      );
      nextRightBtn?.click();
      harness.detectChanges();
      expect(trainer.hits()).toBe(2);

      // Reseteamos el contador -> aciertos y fallos vuelven a 0
      const resetBtn = page?.querySelector<HTMLButtonElement>('[data-testid="trainer-reset"]');
      expect(resetBtn?.textContent).toContain('Resetear contador');
      resetBtn?.click();
      harness.detectChanges();

      expect(trainer.hits()).toBe(0);
      expect(trainer.misses()).toBe(0);
      expect(page?.querySelector('[data-testid="trainer-hits"]')?.textContent).toContain('0');
      expect(page?.querySelector('[data-testid="trainer-misses"]')?.textContent).toContain('0');
    });

    it('marca la Lección 2 como completada y la persiste en ssp_completed_lessons', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-2', Lesson2);
      const page = harness.routeNativeElement;

      const completeBtn = Array.from(
        page?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((btn) => btn.textContent?.includes('Completar Lección 2'));
      expect(completeBtn).toBeTruthy();
      completeBtn?.click();
      harness.detectChanges();

      expect(doc.cookie).toContain(`${COMPLETED_LESSONS_COOKIE}=leccion-2`);
      expect(page?.textContent).toContain('Lección 2 completada');
    });
  });
});

