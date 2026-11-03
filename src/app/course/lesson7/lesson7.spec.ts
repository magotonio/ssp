import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from '../../app.routes';
import { DECK_SIZE, SSP_STACK } from '../../ssp/ssp-stack';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course-progress.service';
import { Lesson6 } from '../lesson6/lesson6';
import { getRelativeKingdomZone, Lesson7 } from './lesson7';
import {
  CUT_TRAINING_PHASES,
  evaluateCutAttempt,
  mapRatioToDeckPosition,
  RiffleCutTrainer,
} from './riffle-cut-trainer';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Lección 7 · Integración, corte al tacto, barra de rifleado y cálculo de desvío por fases', () => {
  describe('Cálculo normativo de cortes de referencia (26, 13, 39) y evaluación del desvío', () => {
    it('verifica las cartas guía de los bloques en ordenacion-ssp.md y las zonas relativas del reino', () => {
      expect(SSP_STACK[25].code).toBe('KC'); // #26 Rey de Corazones
      expect(SSP_STACK[12].code).toBe('KP'); // #13 Rey de Picas
      expect(SSP_STACK[38].code).toBe('KT'); // #39 Rey de Tréboles
      expect(SSP_STACK[51].code).toBe('KD'); // #52 Rey de Diamantes

      expect(CUT_TRAINING_PHASES.map((p) => p.id)).toEqual([
        'cut-26',
        'cut-13',
        'cut-39',
        'cycle-52',
      ]);

      expect(getRelativeKingdomZone(1).id).toBe('start');
      expect(getRelativeKingdomZone(4).id).toBe('start');
      expect(getRelativeKingdomZone(8).id).toBe('middle');
      expect(getRelativeKingdomZone(13).id).toBe('end');
    });

    it('evalúa cortes exactos, cortes por arriba (menos cartas) y por abajo (más cartas)', () => {
      const exact26 = evaluateCutAttempt(26, 26);
      expect(exact26.isExact).toBe(true);
      expect(exact26.distance).toBe(0);
      expect(exact26.direction).toBeNull();
      expect(exact26.withinPhysicalTolerance).toBe(true);
      expect(exact26.cutCard.code).toBe('KC');

      const shortCut = evaluateCutAttempt(26, 23); // QC en #23 -> 3 cartas por arriba
      expect(shortCut.isExact).toBe(false);
      expect(shortCut.direction).toBe('above');
      expect(shortCut.distance).toBe(3);
      expect(shortCut.withinPhysicalTolerance).toBe(true);
      expect(shortCut.cutCard.code).toBe('QC');

      const deepCut = evaluateCutAttempt(13, 18); // 6T en #18 -> 5 cartas por abajo
      expect(deepCut.isExact).toBe(false);
      expect(deepCut.direction).toBe('below');
      expect(deepCut.distance).toBe(5);
      expect(deepCut.withinPhysicalTolerance).toBe(false);
      expect(deepCut.cutCard.code).toBe('6T');

      expect(mapRatioToDeckPosition(0)).toBe(1);
      expect(mapRatioToDeckPosition(0.5)).toBe(26);
      expect(mapRatioToDeckPosition(1)).toBe(52);
    });
  });

  describe('Pantalla interactiva Lesson7 (/curso/leccion-7)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    afterEach(() => {
      vi.useRealTimers();
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    it('guarda ssp_current_lesson=leccion-7 y muestra referencias de corte, zonas del reino e inspector táctil', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-7', Lesson7);
      const page = harness.routeNativeElement;

      expect(doc.cookie).toContain(`${CURRENT_LESSON_COOKIE}=leccion-7`);
      expect(page?.querySelector('header')?.textContent).toContain('Lección 7');
      expect(page?.querySelector('h1')?.textContent).toContain(
        'Integración y localización al tacto',
      );
      expect(page?.textContent).toContain('Rey de Picas');
      expect(page?.textContent).toContain('Rey de Corazones');
      expect(page?.textContent).toContain('Rey de Tréboles');
      expect(page?.textContent).toContain('Tolerancia física ±3 cartas');

      const inspector = page?.querySelector('[data-testid="lesson7-tactile-inspector"]');
      expect(inspector?.textContent).toContain('7 de Diamantes');
      expect(inspector?.textContent).toContain('Reino de Tréboles');
      expect(inspector?.textContent).toContain('Centro del reino');
      expect(inspector?.textContent).toContain('#34 / 52');
    });

    it('redirige /curso a /curso/leccion-7 cuando el usuario se quedó en la Lección 7', async () => {
      const doc = TestBed.inject(DOCUMENT);
      doc.cookie = `${CURRENT_LESSON_COOKIE}=leccion-7; path=/`;

      const router = TestBed.inject(Router);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso', Lesson7);

      expect(router.url).toBe('/curso/leccion-7');
    });

    it('enlaza desde la Lección 6 hacia /curso/leccion-7 y permite completar la Lección 7', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();

      await harness.navigateByUrl('/curso/leccion-6', Lesson6);
      const lesson6Page = harness.routeNativeElement;
      const linkToLesson7 = Array.from(
        lesson6Page?.querySelectorAll<HTMLAnchorElement>('a') ?? [],
      ).find((link) => link.textContent?.includes('Ir a la Lección 7'));
      expect(linkToLesson7).toBeTruthy();
      expect(linkToLesson7?.getAttribute('href')).toBe('/curso/leccion-7');

      await harness.navigateByUrl('/curso/leccion-7', Lesson7);
      const lesson7Page = harness.routeNativeElement;
      const completeBtn = Array.from(
        lesson7Page?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((btn) => btn.textContent?.includes('Completar Lección 7'));
      expect(completeBtn).toBeTruthy();
      completeBtn?.click();
      harness.detectChanges();

      expect(doc.cookie).toContain(`${COMPLETED_LESSONS_COOKIE}=leccion-7`);
      expect(lesson7Page?.textContent).toContain('Lección 7 completada');
    });

    it('entrena las fases 26 → 13 → 39 con arrastre/rifleado en barra, acierto directo y cálculo de desvío por arriba/abajo', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-7', Lesson7);
      const page = harness.routeNativeElement;

      const trainerDebug = harness.fixture.debugElement.query(By.directive(RiffleCutTrainer));
      expect(trainerDebug).toBeTruthy();
      const trainer = trainerDebug.componentInstance as RiffleCutTrainer;

      // Arranca en Fase 1: Cortar 26 (Rey de Corazones)
      expect(trainer.activePhaseId()).toBe('cut-26');
      expect(page?.querySelector('[data-testid="cut-trainer-target"]')?.textContent).toContain(
        'Cortar 26 cartas (Rey de Corazones)',
      );

      // Simulamos arrastrar, riflear y soltar con puntero sobre la mitad exacta de la barra (#26)
      const trackEl = page?.querySelector<HTMLElement>('[data-testid="riffle-bar-track"]');
      const arenaEl = page?.querySelector<HTMLElement>('[data-testid="riffle-arena"]');
      expect(trackEl).toBeTruthy();
      expect(arenaEl).toBeTruthy();

      vi.spyOn(trackEl!, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        right: 620,
        width: 520,
        top: 0,
        bottom: 54,
        height: 54,
        x: 100,
        y: 0,
        toJSON: () => ({}),
      });

      arenaEl?.dispatchEvent(
        new PointerEvent('pointerdown', { pointerId: 1, button: 0, clientX: 140, bubbles: true }),
      );
      harness.detectChanges();
      expect(trainer.isDragging()).toBe(true);
      expect(trainer.riffleSlot()).toBe(4);

      // Rifleamos hasta la mitad exacta: 100 + 255 = 355 -> ratio 255/520 = 0.4903 -> ceil(25.5) = 26
      arenaEl?.dispatchEvent(
        new PointerEvent('pointermove', { pointerId: 1, clientX: 355, bubbles: true }),
      );
      harness.detectChanges();
      expect(trainer.riffleSlot()).toBe(26);

      // Soltamos en #26 -> ¡Acierto directo!
      arenaEl?.dispatchEvent(
        new PointerEvent('pointerup', { pointerId: 1, clientX: 355, bubbles: true }),
      );
      harness.detectChanges();

      expect(trainer.stage()).toBe('resolved');
      expect(trainer.exactCuts()).toBe(1);
      expect(trainer.completedPhases()).toContain('cut-26');
      expect(page?.querySelector('[data-testid="resolved-panel"]')?.textContent).toContain(
        '¡Correcto! Clavaste exactamente la carta #26',
      );

      // Pasamos a Fase 2: Cortar 13 (Rey de Picas)
      page?.querySelector<HTMLButtonElement>('[data-testid="next-phase-btn"]')?.click();
      harness.detectChanges();
      expect(trainer.activePhaseId()).toBe('cut-13');

      // En Fase 2 cortamos en #10 (QP · Reina de Picas): 3 cartas por arriba de #13
      trainer.performCut(10);
      harness.detectChanges();

      expect(trainer.stage()).toBe('awaiting-deviation');
      const cutCardBox = page?.querySelector('[data-testid="cut-trainer-cut-card"]');
      expect(cutCardBox?.textContent).toContain('Reina de Picas');
      // Mientras calcula el desvío no debe filtrarse la posición #10
      expect(cutCardBox?.textContent).not.toContain('#10');
      expect(page?.querySelector('[data-testid="deviation-panel"]')).toBeTruthy();

      // Fallamos primero indicando sentido opuesto (por abajo, 3) -> muestra pista específica
      page?.querySelector<HTMLButtonElement>('[data-testid="deviation-dir-below"]')?.click();
      page?.querySelector<HTMLButtonElement>('[data-testid="deviation-quick-3"]')?.click();
      harness.detectChanges();
      page?.querySelector<HTMLButtonElement>('[data-testid="deviation-submit"]')?.click();
      harness.detectChanges();

      expect(trainer.stage()).toBe('awaiting-deviation');
      expect(trainer.deviationMisses()).toBe(1);
      expect(page?.querySelector('[data-testid="deviation-panel"]')?.textContent).toContain(
        'el sentido es el contrario',
      );

      // Corregimos a «Por arriba» y 3 cartas -> resuelve el desvío y muestra el pin #13 en la barra
      page?.querySelector<HTMLButtonElement>('[data-testid="deviation-dir-above"]')?.click();
      harness.detectChanges();
      page?.querySelector<HTMLButtonElement>('[data-testid="deviation-submit"]')?.click();
      harness.detectChanges();

      expect(trainer.stage()).toBe('resolved');
      expect(trainer.deviationHits()).toBe(1);
      expect(page?.querySelector('[data-testid="riffle-target-pin"]')?.textContent).toContain(
        '#13 · KP',
      );

      // Volvemos a cortar en Fase 2 con teclado y clavamos #13 -> completa Fase 2 y avanza a Fase 3 (Cortar 39)
      page?.querySelector<HTMLButtonElement>('[data-testid="repeat-cut-btn"]')?.click();
      harness.detectChanges();
      const handleEl = page?.querySelector<HTMLElement>('[data-testid="riffle-cutter-handle"]');
      for (let i = 0; i < 13; i++) {
        handleEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      }
      handleEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      harness.detectChanges();

      expect(trainer.completedPhases()).toContain('cut-13');
      page?.querySelector<HTMLButtonElement>('[data-testid="next-phase-btn"]')?.click();
      harness.detectChanges();
      expect(trainer.activePhaseId()).toBe('cut-39');

      // En Fase 3 cortamos pasado por abajo en #42 (AC -> 3 cartas por abajo de #39) y luego clavamos #39
      trainer.performCut(42);
      trainer.selectDirection('below');
      trainer.selectQuickDistance(3);
      trainer.submitDeviation();
      trainer.advanceAfterResolved();
      trainer.performCut(39);
      harness.detectChanges();

      expect(trainer.completedPhases()).toContain('cut-39');
      page?.querySelector<HTMLButtonElement>('[data-testid="next-phase-btn"]')?.click();
      harness.detectChanges();
      expect(trainer.activePhaseId()).toBe('cycle-52');
    });

    it('completa el ciclo aleatorio de 52 cartas en la Fase 4 combinando cortes exactos y desvíos resueltos', async () => {
      vi.useFakeTimers();

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-7', Lesson7);
      const page = harness.routeNativeElement;

      const trainer = harness.fixture.debugElement.query(By.directive(RiffleCutTrainer))
        .componentInstance as RiffleCutTrainer;

      trainer.selectPhase('cycle-52');
      harness.detectChanges();

      expect(trainer.deck()).toHaveLength(DECK_SIZE);
      expect(new Set(trainer.deck().map((c) => c.code)).size).toBe(DECK_SIZE);

      // Fijamos el orden de prueba con las 52 cartas de SSP_STACK
      trainer.setDeckForTesting(SSP_STACK);
      harness.detectChanges();

      // Carta 1 (#1 · 9P): cortamos en #5 (6C -> 4 cartas por abajo)
      trainer.performCut(5);
      vi.advanceTimersByTime(1_200);
      trainer.selectDirection('below');
      trainer.selectQuickDistance(4);
      trainer.submitDeviation();
      expect(trainer.stage()).toBe('resolved');
      trainer.advanceAfterResolved();

      // Cartas 2..52: cortes directos exactos
      for (let pos = 2; pos <= DECK_SIZE; pos++) {
        trainer.performCut(pos);
        if (pos < DECK_SIZE) {
          trainer.advanceAfterResolved();
        }
      }
      harness.detectChanges();

      expect(trainer.isCycleCompleted()).toBe(true);
      expect(trainer.isTimerRunning()).toBe(false);
      expect(trainer.exactCuts()).toBe(51);
      expect(trainer.deviationHits()).toBe(1);
      expect(trainer.completedPhases()).toContain('cycle-52');
      expect(page?.querySelector('[data-testid="cut-trainer-cycle-summary"]')).toBeTruthy();

      // Resetear ciclo vuelve a mezclar las 52 cartas y limpia marcadores
      page?.querySelector<HTMLButtonElement>('[data-testid="cut-trainer-reset"]')?.click();
      harness.detectChanges();
      expect(trainer.isCycleCompleted()).toBe(false);
      expect(trainer.totalCuts()).toBe(0);
      expect(new Set(trainer.deck().map((c) => c.code)).size).toBe(DECK_SIZE);
    });
  });
});

