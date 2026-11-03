import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from '../../app.routes';
import {
  DECK_SIZE,
  getNextCardValue,
  getNextSspCard,
  getNextSuit,
  SSP_STACK,
} from '../../ssp/ssp-stack';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course-progress.service';
import { Lesson3 } from '../lesson3/lesson3';
import { Lesson4 } from './lesson4';
import {
  formatStopwatchTime,
  NextCardTrainer,
  shuffleSspDeck,
} from './next-card-trainer';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Lección 4 · Integración de índice y palo y entrenador de ciclo completo', () => {
  describe('Regla combinada normativa y barajado de ciclo completo', () => {
    it('calcula la carta siguiente exacta para las 52 cartas (incluyendo salto de +2 palos en A–4 y cierre KD -> 9P)', () => {
      for (const card of SSP_STACK) {
        const nextCard = getNextSspCard(card);
        const expectedValue = getNextCardValue(card.value);
        const expectedSuit = getNextSuit(card.suit, card.value >= 5 ? 1 : 2);

        expect(nextCard.value).toBe(expectedValue);
        expect(nextCard.suit).toBe(expectedSuit);
      }

      // Ejemplos normativos de leccion4.md y ordenacion-ssp.md
      expect(getNextSspCard(SSP_STACK[0]).code).toBe('5C'); // 9P -> 5C
      expect(getNextSspCard(SSP_STACK[1]).code).toBe('AT'); // 5C -> AT
      expect(getNextSspCard(SSP_STACK[2]).code).toBe('10P'); // AT -> 10P (salto de palo)
      expect(getNextSspCard(SSP_STACK[51]).code).toBe('9P'); // KD -> 9P (cierre)
    });

    it('desordena internamente las 52 cartas manteniendo el ciclo completo sin repeticiones ni omisiones', () => {
      let seed = 7;
      const deterministicRandom = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      const shuffled = shuffleSspDeck(SSP_STACK, deterministicRandom);
      expect(shuffled).toHaveLength(DECK_SIZE);
      expect(new Set(shuffled.map((c) => c.code)).size).toBe(DECK_SIZE);
      expect(shuffled.map((c) => c.code)).not.toEqual(SSP_STACK.map((c) => c.code));
    });

    it('formatea el cronómetro en mm:ss y hh:mm:ss', () => {
      expect(formatStopwatchTime(0)).toBe('00:00');
      expect(formatStopwatchTime(65_400)).toBe('01:05');
      expect(formatStopwatchTime(3_661_000)).toBe('01:01:01');
    });
  });

  describe('Pantalla interactiva Lesson4 (/curso/leccion-4)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    afterEach(() => {
      vi.useRealTimers();
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    it('guarda ssp_current_lesson=leccion-4 y muestra la explicación combinada y el comprobador', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-4', Lesson4);
      const page = harness.routeNativeElement;

      expect(doc.cookie).toContain(`${CURRENT_LESSON_COOKIE}=leccion-4`);
      expect(page?.querySelector('header')?.textContent).toContain('Lección 4');
      expect(page?.querySelector('h1')?.textContent).toContain('siguiente carta exacta');
      expect(page?.textContent).toContain('salto de palo');

      const inspector = page?.querySelector('[data-testid="lesson4-card-inspector"]');
      expect(inspector?.textContent).toContain('9 de Picas');
      expect(inspector?.textContent).toContain('5 de Corazones');

      const redSuitSpans = Array.from(page?.querySelectorAll<HTMLElement>('.suit-red') ?? []);
      expect(redSuitSpans).toHaveLength(8);
      expect(redSuitSpans.every((el) => el.textContent === '♥' || el.textContent === '♦')).toBe(
        true,
      );
    });

    it('redirige /curso a /curso/leccion-4 cuando el usuario se quedó en la Lección 4', async () => {
      const doc = TestBed.inject(DOCUMENT);
      doc.cookie = `${CURRENT_LESSON_COOKIE}=leccion-4; path=/`;

      const router = TestBed.inject(Router);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso', Lesson4);

      expect(router.url).toBe('/curso/leccion-4');
    });

    it('marca la Lección 4 como completada y enlaza desde la Lección 3 hacia /curso/leccion-4', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();

      await harness.navigateByUrl('/curso/leccion-3', Lesson3);
      const lesson3Page = harness.routeNativeElement;
      const linkToLesson4 = Array.from(
        lesson3Page?.querySelectorAll<HTMLAnchorElement>('a') ?? [],
      ).find((link) => link.textContent?.includes('Ir a la Lección 4'));
      expect(linkToLesson4).toBeTruthy();
      expect(linkToLesson4?.getAttribute('href')).toBe('/curso/leccion-4');

      await harness.navigateByUrl('/curso/leccion-4', Lesson4);
      const lesson4Page = harness.routeNativeElement;
      const completeBtn = Array.from(
        lesson4Page?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((btn) => btn.textContent?.includes('Completar Lección 4'));
      expect(completeBtn).toBeTruthy();
      completeBtn?.click();
      harness.detectChanges();

      expect(doc.cookie).toContain(`${COMPLETED_LESSONS_COOKIE}=leccion-4`);
      expect(lesson4Page?.textContent).toContain('Lección 4 completada');
    });

    it('evalúa índice y palo en cualquier orden, cronometra el tiempo, cuenta aciertos/fallos y completa las 52 cartas', async () => {
      vi.useFakeTimers();

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-4', Lesson4);
      const page = harness.routeNativeElement;

      const trainerDebug = harness.fixture.debugElement.query(By.directive(NextCardTrainer));
      expect(trainerDebug).toBeTruthy();
      const trainer = trainerDebug.componentInstance as NextCardTrainer;

      // Por defecto baraja las 52 cartas únicas
      expect(trainer.deck()).toHaveLength(52);
      expect(new Set(trainer.deck().map((c) => c.code)).size).toBe(52);

      // Fijamos el orden de las 52 cartas para verificar aciertos, fallos, cronómetro y fin de ciclo
      trainer.setDeckForTesting(SSP_STACK);
      harness.detectChanges();

      expect(page?.querySelector('[data-testid="card-trainer-progress"]')?.textContent).toContain(
        '1 / 52',
      );
      expect(page?.querySelector('[data-testid="card-trainer-timer"]')?.textContent).toContain(
        '00:00',
      );

      // Inicialmente el cronómetro está parado: la carta sale oculta con «?» y los botones deshabilitados
      const hiddenCardBtn = page?.querySelector<HTMLButtonElement>(
        '[data-testid="card-trainer-hidden-card"]',
      );
      expect(hiddenCardBtn).toBeTruthy();
      expect(hiddenCardBtn?.textContent).toContain('?');
      expect(page?.querySelector('[data-testid="card-trainer-prompt"]')).toBeNull();

      const rank5Btn = page?.querySelector<HTMLButtonElement>('.index-choice-btn[data-rank="5"]');
      const suitTBtn = page?.querySelector<HTMLButtonElement>('.suit-choice-btn[data-suit="T"]');
      expect(rank5Btn?.disabled).toBe(true);
      expect(suitTBtn?.disabled).toBe(true);

      // Hacer clic en la interrogación inicia el cronómetro, revela la carta y habilita la selección
      hiddenCardBtn?.click();
      harness.detectChanges();
      expect(trainer.isTimerRunning()).toBe(true);
      expect(page?.querySelector('[data-testid="card-trainer-prompt"]')?.textContent).toContain('9');
      expect(rank5Btn?.disabled).toBe(false);
      expect(suitTBtn?.disabled).toBe(false);

      // Si se pausa el cronómetro, la carta vuelve a ocultarse con «?» y se inutilizan los botones
      const timerToggleBtn = page?.querySelector<HTMLButtonElement>(
        '[data-testid="card-trainer-timer-toggle"]',
      );
      timerToggleBtn?.click();
      harness.detectChanges();
      expect(trainer.isTimerRunning()).toBe(false);
      expect(page?.querySelector('[data-testid="card-trainer-hidden-card"]')).toBeTruthy();
      expect(page?.querySelector('[data-testid="card-trainer-prompt"]')).toBeNull();
      expect(rank5Btn?.disabled).toBe(true);

      // Si se pulsa Play en el cronómetro, se vuelve a revelar la carta y habilitar la selección
      timerToggleBtn?.click();
      harness.detectChanges();
      expect(trainer.isTimerRunning()).toBe(true);
      expect(page?.querySelector('[data-testid="card-trainer-prompt"]')).toBeTruthy();
      expect(rank5Btn?.disabled).toBe(false);

      // Carta 1: 9P -> esperada 5C. Probamos un fallo eligiendo índice 5 pero palo equivocado (T)
      rank5Btn?.click();
      harness.detectChanges();

      vi.advanceTimersByTime(3_200);
      harness.detectChanges();
      expect(page?.querySelector('[data-testid="card-trainer-timer"]')?.textContent).toContain(
        '00:03',
      );

      suitTBtn?.click();
      harness.detectChanges();

      expect(trainer.misses()).toBe(1);
      expect(trainer.hits()).toBe(0);
      expect(trainer.currentIndex()).toBe(0); // se mantiene en 9P

      // Ahora acertamos 9P -> 5C seleccionando primero el palo (C) y después el índice (5)
      const suitCBtn = page?.querySelector<HTMLButtonElement>('.suit-choice-btn[data-suit="C"]');
      suitCBtn?.click();
      rank5Btn?.click();
      harness.detectChanges();

      expect(trainer.hits()).toBe(1);
      expect(trainer.misses()).toBe(1);
      expect(trainer.currentIndex()).toBe(1); // pasa a 5C (carta 2 / 52)

      // Completamos las 51 cartas restantes del ciclo
      for (let idx = 1; idx < SSP_STACK.length; idx++) {
        const expected = getNextSspCard(SSP_STACK[idx]);
        trainer.selectRank(expected.value);
        trainer.selectSuit(expected.suit);
      }
      harness.detectChanges();

      expect(trainer.hits()).toBe(52);
      expect(trainer.isCycleCompleted()).toBe(true);
      expect(trainer.isTimerRunning()).toBe(false);
      expect(page?.querySelector('[data-testid="card-trainer-summary"]')).toBeTruthy();

      // Reseteamos el ciclo desde el botón superior de reseteo
      const resetBtn = page?.querySelector<HTMLButtonElement>('[data-testid="card-trainer-reset"]');
      resetBtn?.click();
      harness.detectChanges();

      expect(trainer.hits()).toBe(0);
      expect(trainer.misses()).toBe(0);
      expect(trainer.elapsedMs()).toBe(0);
      expect(trainer.isCycleCompleted()).toBe(false);
      expect(trainer.deck()).toHaveLength(52);
      expect(new Set(trainer.deck().map((c) => c.code)).size).toBe(52);
    });
  });
});

