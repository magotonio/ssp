import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from '../../app.routes';
import { DECK_SIZE, getSspCardByValueAndSuit, SSP_STACK, SUIT_CYCLE } from '../../ssp/ssp-stack';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course-progress.service';
import { Lesson4 } from '../lesson4/lesson4';
import {
  getCardCharacterId,
  getCardKingdom,
  KINGDOMS,
  KingdomTrainer,
} from './kingdom-trainer';
import { Lesson5 } from './lesson5';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Lección 5 · Los cuatro reinos y entrenador de clasificación de 52 cartas', () => {
  describe('Clasificación normativa en 4 reinos mediante Nobles, Políticos y Científicos', () => {
    it('asigna las 52 cartas de SSP_STACK exactamente al bloque de 13 cartas de su reino', () => {
      expect(KINGDOMS).toHaveLength(4);

      for (const card of SSP_STACK) {
        const kingdom = getCardKingdom(card);
        const expectedBlockOrder = Math.floor((card.position - 1) / 13) + 1;
        const expectedBlockSuit = SUIT_CYCLE[expectedBlockOrder - 1];

        expect(kingdom.order).toBe(expectedBlockOrder);
        expect(kingdom.suit).toBe(expectedBlockSuit);
        expect(card.position).toBeGreaterThanOrEqual(kingdom.startPosition);
        expect(card.position).toBeLessThanOrEqual(kingdom.endPosition);
      }
    });

    it('verifica todos los ejemplos explícitos de leccion5.md para Nobles, Políticos y Científicos', () => {
      // Nobles (9 al K): dicen la verdad -> su propio palo
      const tenHearts = getSspCardByValueAndSuit(10, 'C');
      expect(getCardCharacterId(tenHearts.value)).toBe('noble');
      expect(getCardKingdom(tenHearts).suit).toBe('C');

      const kingClubs = getSspCardByValueAndSuit(13, 'T');
      expect(getCardCharacterId(kingClubs.value)).toBe('noble');
      expect(getCardKingdom(kingClubs).suit).toBe('T');

      const kingSpades = getSspCardByValueAndSuit(13, 'P');
      expect(getCardCharacterId(kingSpades.value)).toBe('noble');
      expect(getCardKingdom(kingSpades).suit).toBe('P');

      // Políticos (A al 4): mienten en el palo, dicen la verdad en el color -> homólogo
      const threeHearts = getSspCardByValueAndSuit(3, 'C');
      expect(getCardCharacterId(threeHearts.value)).toBe('politician');
      expect(getCardKingdom(threeHearts).suit).toBe('D');

      const twoClubs = getSspCardByValueAndSuit(2, 'T');
      expect(getCardCharacterId(twoClubs.value)).toBe('politician');
      expect(getCardKingdom(twoClubs).suit).toBe('P');

      // Científicos (5 al 8): adelantados a su época -> reino anterior en P -> C -> T -> D
      const eightHearts = getSspCardByValueAndSuit(8, 'C');
      expect(getCardCharacterId(eightHearts.value)).toBe('scientist');
      expect(getCardKingdom(eightHearts).suit).toBe('P');

      const fiveClubs = getSspCardByValueAndSuit(5, 'T');
      expect(getCardCharacterId(fiveClubs.value)).toBe('scientist');
      expect(getCardKingdom(fiveClubs).suit).toBe('C');

      const sevenDiamonds = getSspCardByValueAndSuit(7, 'D');
      expect(getCardCharacterId(sevenDiamonds.value)).toBe('scientist');
      expect(getCardKingdom(sevenDiamonds).suit).toBe('T');

      const sixSpades = getSspCardByValueAndSuit(6, 'P');
      expect(getCardCharacterId(sixSpades.value)).toBe('scientist');
      expect(getCardKingdom(sixSpades).suit).toBe('D');
    });
  });

  describe('Pantalla interactiva Lesson5 (/curso/leccion-5)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    afterEach(() => {
      vi.useRealTimers();
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    it('guarda ssp_current_lesson=leccion-5 y muestra los 4 reinos, los 3 personajes y el comprobador', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-5', Lesson5);
      const page = harness.routeNativeElement;

      expect(doc.cookie).toContain(`${CURRENT_LESSON_COOKIE}=leccion-5`);
      expect(page?.querySelector('header')?.textContent).toContain('Lección 5');
      expect(page?.querySelector('h1')?.textContent).toContain('cuatro reinos');
      expect(page?.textContent).toContain('Los Nobles');
      expect(page?.textContent).toContain('Los Políticos');
      expect(page?.textContent).toContain('Los Científicos');

      const blockDetail = page?.querySelector('[data-testid="lesson5-kingdom-block-detail"]');
      expect(blockDetail?.textContent).toContain('Reino de Picas');
      expect(blockDetail?.textContent).toContain('#1');
      expect(blockDetail?.textContent).toContain('#13');

      const inspector = page?.querySelector('[data-testid="lesson5-kingdom-inspector"]');
      expect(inspector?.textContent).toContain('10 de Corazones');
      expect(inspector?.textContent).toContain('Reino de Corazones');
    });

    it('redirige /curso a /curso/leccion-5 cuando el usuario se quedó en la Lección 5', async () => {
      const doc = TestBed.inject(DOCUMENT);
      doc.cookie = `${CURRENT_LESSON_COOKIE}=leccion-5; path=/`;

      const router = TestBed.inject(Router);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso', Lesson5);

      expect(router.url).toBe('/curso/leccion-5');
    });

    it('enlaza desde la Lección 4 hacia /curso/leccion-5 y marca la Lección 5 como completada', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();

      await harness.navigateByUrl('/curso/leccion-4', Lesson4);
      const lesson4Page = harness.routeNativeElement;
      const linkToLesson5 = Array.from(
        lesson4Page?.querySelectorAll<HTMLAnchorElement>('a') ?? [],
      ).find((link) => link.textContent?.includes('Ir a la Lección 5'));
      expect(linkToLesson5).toBeTruthy();
      expect(linkToLesson5?.getAttribute('href')).toBe('/curso/leccion-5');

      await harness.navigateByUrl('/curso/leccion-5', Lesson5);
      const lesson5Page = harness.routeNativeElement;
      const completeBtn = Array.from(
        lesson5Page?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((btn) => btn.textContent?.includes('Completar Lección 5'));
      expect(completeBtn).toBeTruthy();
      completeBtn?.click();
      harness.detectChanges();

      expect(doc.cookie).toContain(`${COMPLETED_LESSONS_COOKIE}=leccion-5`);
      expect(lesson5Page?.textContent).toContain('Lección 5 completada');
    });

    it('entrena las 52 cartas mezcladas adivinando el reino con cronómetro, aciertos, errores y reseteo', async () => {
      vi.useFakeTimers();

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-5', Lesson5);
      const page = harness.routeNativeElement;

      const trainerDebug = harness.fixture.debugElement.query(By.directive(KingdomTrainer));
      expect(trainerDebug).toBeTruthy();
      const trainer = trainerDebug.componentInstance as KingdomTrainer;

      // Por defecto baraja las 52 cartas únicas
      expect(trainer.deck()).toHaveLength(DECK_SIZE);
      expect(new Set(trainer.deck().map((c) => c.code)).size).toBe(DECK_SIZE);

      // Fijamos el orden de las 52 cartas para probar aciertos, errores, pausa y fin de ciclo
      trainer.setDeckForTesting(SSP_STACK);
      harness.detectChanges();

      expect(page?.querySelector('[data-testid="kingdom-trainer-progress"]')?.textContent).toContain(
        '1 / 52',
      );
      expect(page?.querySelector('[data-testid="kingdom-trainer-timer"]')?.textContent).toContain(
        '00:00',
      );

      // Inicialmente la carta está oculta tras «?» y los botones de reinos están deshabilitados
      const hiddenCardBtn = page?.querySelector<HTMLButtonElement>(
        '[data-testid="kingdom-trainer-hidden-card"]',
      );
      expect(hiddenCardBtn).toBeTruthy();
      expect(hiddenCardBtn?.textContent).toContain('?');
      expect(page?.querySelector('[data-testid="kingdom-trainer-prompt"]')).toBeNull();

      const kingdomPBtn = page?.querySelector<HTMLButtonElement>(
        '.kingdom-choice-btn[data-kingdom="P"]',
      );
      const kingdomCBtn = page?.querySelector<HTMLButtonElement>(
        '.kingdom-choice-btn[data-kingdom="C"]',
      );
      expect(kingdomPBtn?.disabled).toBe(true);
      expect(kingdomCBtn?.disabled).toBe(true);

      // Pulsar «?» inicia el cronómetro, revela la primera carta (9P) y habilita los botones
      hiddenCardBtn?.click();
      harness.detectChanges();
      expect(trainer.isTimerRunning()).toBe(true);
      expect(page?.querySelector('[data-testid="kingdom-trainer-prompt"]')?.textContent).toContain(
        '9',
      );
      expect(kingdomPBtn?.disabled).toBe(false);

      // Pausar oculta la carta y vuelve a deshabilitar los botones
      const timerToggleBtn = page?.querySelector<HTMLButtonElement>(
        '[data-testid="kingdom-trainer-timer-toggle"]',
      );
      timerToggleBtn?.click();
      harness.detectChanges();
      expect(trainer.isTimerRunning()).toBe(false);
      expect(page?.querySelector('[data-testid="kingdom-trainer-hidden-card"]')).toBeTruthy();
      expect(kingdomPBtn?.disabled).toBe(true);

      // Reanudar con Play
      timerToggleBtn?.click();
      harness.detectChanges();
      expect(trainer.isTimerRunning()).toBe(true);

      vi.advanceTimersByTime(2_400);
      harness.detectChanges();
      expect(page?.querySelector('[data-testid="kingdom-trainer-timer"]')?.textContent).toContain(
        '00:02',
      );

      // Carta 1: 9P (Noble -> Reino de Picas). Provocamos un fallo eligiendo Corazones
      kingdomCBtn?.click();
      harness.detectChanges();

      expect(trainer.misses()).toBe(1);
      expect(trainer.hits()).toBe(0);
      expect(trainer.currentIndex()).toBe(0); // permanece en 9P para reintentar
      expect(page?.textContent).toContain('Noble');

      // Ahora acertamos eligiendo Reino de Picas
      kingdomPBtn?.click();
      harness.detectChanges();

      expect(trainer.hits()).toBe(1);
      expect(trainer.misses()).toBe(1);
      expect(trainer.currentIndex()).toBe(1); // pasa a 5C (carta 2 / 52)

      // Completamos las 51 cartas restantes del ciclo
      for (let idx = 1; idx < SSP_STACK.length; idx++) {
        const expectedKingdom = getCardKingdom(SSP_STACK[idx]);
        trainer.selectKingdom(expectedKingdom.suit);
      }
      harness.detectChanges();

      expect(trainer.hits()).toBe(52);
      expect(trainer.isCycleCompleted()).toBe(true);
      expect(trainer.isTimerRunning()).toBe(false);
      expect(page?.querySelector('[data-testid="kingdom-trainer-summary"]')).toBeTruthy();

      // Reseteamos el ciclo
      const resetBtn = page?.querySelector<HTMLButtonElement>(
        '[data-testid="kingdom-trainer-reset"]',
      );
      resetBtn?.click();
      harness.detectChanges();

      expect(trainer.hits()).toBe(0);
      expect(trainer.misses()).toBe(0);
      expect(trainer.elapsedMs()).toBe(0);
      expect(trainer.isCycleCompleted()).toBe(false);
      expect(trainer.deck()).toHaveLength(DECK_SIZE);
      expect(new Set(trainer.deck().map((c) => c.code)).size).toBe(DECK_SIZE);
    });
  });
});

