import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from '../../app.routes';
import { CardValue, SSP_STACK } from '../../ssp/ssp-stack';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course-progress.service';
import { Lesson5 } from '../lesson5/lesson5';
import {
  describeAbsolutePosition,
  getInternalPosition,
  getKingdomOffset,
  INTERNAL_CYCLE_SIZE,
  INTERNAL_POSITION_RULES,
  InternalPositionTrainer,
} from './internal-position-trainer';
import { Lesson6 } from './lesson6';
import { StudyFlashcards } from './study-flashcards';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Lección 6 · Posición interna (1 al 13), fichas de estudio y entrenador cronometrado', () => {
  describe('Cálculo normativo de posición interna (× 3 mód. 13) y unión con el desfase del reino', () => {
    it('coincide con las 13 posiciones internas de leccion6.md y ordenacion-ssp.md', () => {
      expect(INTERNAL_POSITION_RULES).toHaveLength(13);

      const expectedByValue: Readonly<Record<CardValue, number>> = {
        1: 3,
        2: 6,
        3: 9,
        4: 12,
        5: 2,
        6: 5,
        7: 8,
        8: 11,
        9: 1,
        10: 4,
        11: 7,
        12: 10,
        13: 13,
      };

      for (const rule of INTERNAL_POSITION_RULES) {
        expect(getInternalPosition(rule.value)).toBe(expectedByValue[rule.value]);
        expect(rule.internalPosition).toBe(expectedByValue[rule.value]);
      }

      // Las 13 posiciones cubren exactamente del 1 al 13 sin repetirse
      expect(new Set(INTERNAL_POSITION_RULES.map((r) => r.internalPosition)).size).toBe(13);
    });

    it('reproduce exactamente la posición absoluta (1 al 52) de las 52 cartas de SSP_STACK al sumar el desfase (+0, +13, +26, +39)', () => {
      expect(getKingdomOffset('P')).toBe(0);
      expect(getKingdomOffset('C')).toBe(13);
      expect(getKingdomOffset('T')).toBe(26);
      expect(getKingdomOffset('D')).toBe(39);

      for (const card of SSP_STACK) {
        const breakdown = describeAbsolutePosition(card);
        const expectedInternalInBlock = ((card.position - 1) % 13) + 1;

        expect(breakdown.internalPosition).toBe(expectedInternalInBlock);
        expect(breakdown.internalPosition + breakdown.offset).toBe(card.position);
        expect(breakdown.absolutePosition).toBe(card.position);
      }
    });
  });

  describe('Pantalla interactiva Lesson6 (/curso/leccion-6)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    afterEach(() => {
      vi.useRealTimers();
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    it('guarda ssp_current_lesson=leccion-6 y muestra los tres métodos, desfases, comprobador y marcado de baraja', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-6', Lesson6);
      const page = harness.routeNativeElement;

      expect(doc.cookie).toContain(`${CURRENT_LESSON_COOKIE}=leccion-6`);
      expect(page?.querySelector('header')?.textContent).toContain('Lección 6');
      expect(page?.querySelector('h1')?.textContent).toContain('Posición interna exacta');
      expect(page?.textContent).toContain('+0');
      expect(page?.textContent).toContain('+13');
      expect(page?.textContent).toContain('+26');
      expect(page?.textContent).toContain('+39');
      expect(page?.textContent).toContain('"Muñeco de nieve"');
      expect(page?.textContent).toContain(
        'El 8 está formado por dos círculos superpuestos que recuerdan a un muñeco de nieve (2 bolas). Como el número 11 se compone de dos unos (2 elementos), conectamos un par con el otro par → 11.ª posición.',
      );
      expect(page?.textContent).toContain('chica 10');
      expect(page?.textContent).toContain('DIEZ');
      expect(page?.textContent).toContain('marcado de una baraja del 1 al 52');

      const inspector = page?.querySelector('[data-testid="lesson6-position-inspector"]');
      expect(inspector?.textContent).toContain('10 de Corazones');
      expect(inspector?.textContent).toContain('4.ª');
      expect(inspector?.textContent).toContain('#17');

      const redSuitSpans = Array.from(page?.querySelectorAll<HTMLElement>('.suit-red') ?? []);
      expect(redSuitSpans).toHaveLength(1);
      expect(redSuitSpans[0].textContent).toBe('♦');
    });

    it('redirige /curso a /curso/leccion-6 cuando el usuario se quedó en la Lección 6', async () => {
      const doc = TestBed.inject(DOCUMENT);
      doc.cookie = `${CURRENT_LESSON_COOKIE}=leccion-6; path=/`;

      const router = TestBed.inject(Router);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso', Lesson6);

      expect(router.url).toBe('/curso/leccion-6');
    });

    it('enlaza desde la Lección 5 hacia /curso/leccion-6 y marca la Lección 6 como completada', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();

      await harness.navigateByUrl('/curso/leccion-5', Lesson5);
      const lesson5Page = harness.routeNativeElement;
      const linkToLesson6 = Array.from(
        lesson5Page?.querySelectorAll<HTMLAnchorElement>('a') ?? [],
      ).find((link) => link.textContent?.includes('Ir a la Lección 6'));
      expect(linkToLesson6).toBeTruthy();
      expect(linkToLesson6?.getAttribute('href')).toBe('/curso/leccion-6');

      await harness.navigateByUrl('/curso/leccion-6', Lesson6);
      const lesson6Page = harness.routeNativeElement;
      const completeBtn = Array.from(
        lesson6Page?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((btn) => btn.textContent?.includes('Completar Lección 6'));
      expect(completeBtn).toBeTruthy();
      completeBtn?.click();
      harness.detectChanges();

      expect(doc.cookie).toContain(`${COMPLETED_LESSONS_COOKIE}=leccion-6`);
      expect(lesson6Page?.textContent).toContain('Lección 6 completada');
    });

    it('permite girar, invertir sentido, recorrer y mezclar el mazo de 13 fichas de estudio (Flashcards)', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-6', Lesson6);
      const page = harness.routeNativeElement;

      const flashcardsDebug = harness.fixture.debugElement.query(By.directive(StudyFlashcards));
      expect(flashcardsDebug).toBeTruthy();
      const flashcards = flashcardsDebug.componentInstance as StudyFlashcards;

      expect(flashcards.cardOrder()).toHaveLength(13);
      expect(flashcards.isFlipped()).toBe(false);

      const surfaceBtn = page?.querySelector<HTMLButtonElement>(
        '[data-testid="study-flashcard-surface"]',
      );
      expect(surfaceBtn?.textContent).toContain('A');

      // Girar ficha muestra la 3.ª posición y el apunte de estudio
      surfaceBtn?.click();
      harness.detectChanges();
      expect(flashcards.isFlipped()).toBe(true);
      expect(surfaceBtn?.textContent).toContain('3.ª');
      expect(page?.querySelector('[data-testid="study-flashcard-answer-detail"]')).toBeTruthy();

      // Pasar a la siguiente ficha restablece al anverso (índice 2)
      page?.querySelector<HTMLButtonElement>('[data-testid="flashcards-next"]')?.click();
      harness.detectChanges();
      expect(flashcards.currentIndex()).toBe(1);
      expect(flashcards.isFlipped()).toBe(false);

      // Invertir sentido a Posición -> Índice muestra primero la posición (6.ª para el 2)
      page?.querySelector<HTMLButtonElement>('[data-testid="flashcards-mode-position"]')?.click();
      harness.detectChanges();
      expect(flashcards.frontFace()).toBe('position');
      expect(surfaceBtn?.textContent).toContain('6.ª');

      // Mezclar las 13 fichas conserva las 13 sin repetición y permite restaurar orden A -> K
      page?.querySelector<HTMLButtonElement>('[data-testid="flashcards-shuffle"]')?.click();
      harness.detectChanges();
      expect(flashcards.isShuffled()).toBe(true);
      expect(new Set(flashcards.cardOrder()).size).toBe(13);

      page?.querySelector<HTMLButtonElement>('[data-testid="flashcards-order"]')?.click();
      harness.detectChanges();
      expect(flashcards.isShuffled()).toBe(false);
      expect(flashcards.cardOrder()[0]).toBe(1);
    });

    it('entrena el ciclo de 13 índices con cronómetro, carta oculta «?», pistas en fallos y resumen final', async () => {
      vi.useFakeTimers();

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-6', Lesson6);
      const page = harness.routeNativeElement;

      const trainerDebug = harness.fixture.debugElement.query(
        By.directive(InternalPositionTrainer),
      );
      expect(trainerDebug).toBeTruthy();
      const trainer = trainerDebug.componentInstance as InternalPositionTrainer;

      expect(trainer.sequence()).toHaveLength(INTERNAL_CYCLE_SIZE);
      expect(new Set(trainer.sequence()).size).toBe(INTERNAL_CYCLE_SIZE);

      const orderedValues: readonly CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      trainer.setSequenceForTesting(orderedValues);
      harness.detectChanges();

      expect(page?.querySelector('[data-testid="internal-trainer-progress"]')?.textContent).toContain(
        '1 / 13',
      );
      expect(page?.querySelector('[data-testid="internal-trainer-timer"]')?.textContent).toContain(
        '00:00',
      );

      // Al inicio el índice está oculto tras «?» y los botones 1..13 deshabilitados
      const hiddenBtn = page?.querySelector<HTMLButtonElement>(
        '[data-testid="internal-trainer-hidden-card"]',
      );
      expect(hiddenBtn).toBeTruthy();
      expect(page?.querySelector('[data-testid="internal-trainer-prompt"]')).toBeNull();

      const pos1Btn = page?.querySelector<HTMLButtonElement>(
        '.position-choice-btn[data-position="1"]',
      );
      const pos3Btn = page?.querySelector<HTMLButtonElement>(
        '.position-choice-btn[data-position="3"]',
      );
      expect(pos1Btn?.disabled).toBe(true);
      expect(pos3Btn?.disabled).toBe(true);

      // Pulsar «?» inicia el cronómetro, revela el As (A) y habilita los botones
      hiddenBtn?.click();
      harness.detectChanges();
      expect(trainer.isTimerRunning()).toBe(true);
      expect(page?.querySelector('[data-testid="internal-trainer-prompt"]')?.textContent).toContain(
        'A',
      );
      expect(pos3Btn?.disabled).toBe(false);

      // Pausar oculta de nuevo el índice
      const timerToggleBtn = page?.querySelector<HTMLButtonElement>(
        '[data-testid="internal-trainer-timer-toggle"]',
      );
      timerToggleBtn?.click();
      harness.detectChanges();
      expect(trainer.isTimerRunning()).toBe(false);
      expect(page?.querySelector('[data-testid="internal-trainer-hidden-card"]')).toBeTruthy();

      // Reanudar y avanzar el reloj
      timerToggleBtn?.click();
      harness.detectChanges();
      vi.advanceTimersByTime(1_600);
      harness.detectChanges();
      expect(page?.querySelector('[data-testid="internal-trainer-timer"]')?.textContent).toContain(
        '00:01',
      );

      // Primer índice: As (1 -> 3.ª pos). Provocamos un fallo pulsando 1.ª posición
      pos1Btn?.click();
      harness.detectChanges();
      expect(trainer.misses()).toBe(1);
      expect(trainer.hits()).toBe(0);
      expect(trainer.currentIndex()).toBe(0);
      expect(pos1Btn?.classList.contains('position-choice-btn-failed')).toBe(true);

      // Acertamos pulsando la 3.ª posición
      pos3Btn?.click();
      harness.detectChanges();
      expect(trainer.hits()).toBe(1);
      expect(trainer.misses()).toBe(1);
      expect(trainer.currentIndex()).toBe(1);

      // Completamos los 12 índices restantes
      for (let idx = 1; idx < orderedValues.length; idx++) {
        trainer.selectPosition(getInternalPosition(orderedValues[idx]));
      }
      harness.detectChanges();

      expect(trainer.hits()).toBe(13);
      expect(trainer.isCycleCompleted()).toBe(true);
      expect(trainer.isTimerRunning()).toBe(false);
      expect(page?.querySelector('[data-testid="internal-trainer-summary"]')).toBeTruthy();

      // Resetear ciclo limpia contadores y mezcla los 13 índices de nuevo
      page?.querySelector<HTMLButtonElement>('[data-testid="internal-trainer-reset"]')?.click();
      harness.detectChanges();
      expect(trainer.hits()).toBe(0);
      expect(trainer.misses()).toBe(0);
      expect(trainer.elapsedMs()).toBe(0);
      expect(trainer.isCycleCompleted()).toBe(false);
      expect(new Set(trainer.sequence()).size).toBe(INTERNAL_CYCLE_SIZE);
    });
  });
});

