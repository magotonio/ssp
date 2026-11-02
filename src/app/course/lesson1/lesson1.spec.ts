import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { SSP_STACK } from '../../ssp/ssp-stack';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course-progress.service';
import { Lesson1 } from './lesson1';
import {
  ASSEMBLED_FACE_DOWN_DECK_TOP_TO_BOTTOM,
  ASSEMBLY_PILES_BY_SEPARATION,
  PICKUP_STEPS,
  PREPARED_FACE_UP_DECK_TOP_TO_BOTTOM,
} from './lesson1-assembly';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Lección 1 · Montaje físico de la baraja SSP', () => {
  describe('Modelo mecánico de montaje (lesson1-assembly)', () => {
    it('prepara las 52 cartas cara arriba con AD arriba y KP en el fondo', () => {
      expect(PREPARED_FACE_UP_DECK_TOP_TO_BOTTOM).toHaveLength(52);
      expect(new Set(PREPARED_FACE_UP_DECK_TOP_TO_BOTTOM.map((c) => c.code)).size).toBe(52);
      expect(PREPARED_FACE_UP_DECK_TOP_TO_BOTTOM[0].code).toBe('AD');
      expect(PREPARED_FACE_UP_DECK_TOP_TO_BOTTOM[51].code).toBe('KP');
    });

    it('divide el mazo en 3 montones con AD, 5T y 9C visibles arriba', () => {
      expect(ASSEMBLY_PILES_BY_SEPARATION.map((p) => p.topVisibleCard.code)).toEqual([
        'AD',
        '5T',
        '9C',
      ]);
      expect(ASSEMBLY_PILES_BY_SEPARATION.map((p) => p.cardCount)).toEqual([17, 17, 18]);
    });

    it('genera la secuencia 9, 5, 1, 10, 6, 2, J, 7, 3, Q, 8, 4, K al recoger uno, dos, tres y coincide con el ciclo SSP', () => {
      expect(PICKUP_STEPS).toHaveLength(52);
      expect(PICKUP_STEPS.slice(0, 13).map((s) => s.card.value)).toEqual([
        9, 5, 1, 10, 6, 2, 11, 7, 3, 12, 8, 4, 13,
      ]);
      expect(PICKUP_STEPS[0].card.code).toBe('9C');
      expect(PICKUP_STEPS[1].card.code).toBe('5T');
      expect(PICKUP_STEPS[2].card.code).toBe('AD');
      expect(PICKUP_STEPS[51].card.code).toBe('KP');

      // Al cortar dejando KD abajo (índice 38 -> siguientes desde índice 39), coincide carta por carta con SSP_STACK
      const index9P = ASSEMBLED_FACE_DOWN_DECK_TOP_TO_BOTTOM.findIndex((c) => c.code === '9P');
      expect(index9P).toBe(39);
      const rotatedFrom9P = [
        ...ASSEMBLED_FACE_DOWN_DECK_TOP_TO_BOTTOM.slice(index9P),
        ...ASSEMBLED_FACE_DOWN_DECK_TOP_TO_BOTTOM.slice(0, index9P),
      ];
      expect(rotatedFrom9P.map((c) => c.code)).toEqual(SSP_STACK.map((c) => c.code));
    });
  });

  describe('Pantalla interactiva Lesson1 (/curso/leccion-1)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    afterEach(() => {
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    it('guarda la cookie ssp_current_lesson=leccion-1 y muestra los 4 pasos guiados', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-1', Lesson1);
      const page = harness.routeNativeElement;

      expect(doc.cookie).toContain(`${CURRENT_LESSON_COOKIE}=leccion-1`);
      expect(page?.querySelector('header')?.textContent).toContain('Lección 1');
      expect(page?.querySelector('h1')?.textContent).toContain(
        'Monta la ordenación SSP paso a paso en tus manos',
      );
      expect(page?.querySelectorAll('.step-nav-pill')).toHaveLength(4);
      expect(page?.querySelectorAll('.stack-layer-card')).toHaveLength(4);
      expect(page?.querySelectorAll('.cut-step-card')).toHaveLength(3);
    });

    it('redirige /curso a /curso/leccion-1 cuando el usuario se quedó en la Lección 1', async () => {
      const doc = TestBed.inject(DOCUMENT);
      doc.cookie = `${CURRENT_LESSON_COOKIE}=leccion-1; path=/`;

      const router = TestBed.inject(Router);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso', Lesson1);

      expect(router.url).toBe('/curso/leccion-1');
    });

    it('permite acompañar la recogida carta a carta y marca el paso 3 al llegar a 52/52', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-1', Lesson1);
      const page = harness.routeNativeElement;

      const stepForwardBtn = Array.from(
        page?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((btn) => btn.textContent?.includes('+1 carta'));
      expect(stepForwardBtn).toBeTruthy();

      stepForwardBtn?.click();
      harness.detectChanges();
      expect(page?.querySelector('.rhythm-banner')?.textContent).toContain('9 de Corazones');

      const jumpEndBtn = Array.from(
        page?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((btn) => btn.textContent?.includes('Final (52/52)'));
      expect(jumpEndBtn).toBeTruthy();
      jumpEndBtn?.click();
      harness.detectChanges();

      expect(page?.querySelector('.rhythm-banner')?.textContent).toContain(
        '¡52 CARTAS RECOGIDAS!',
      );
      expect(page?.textContent).toContain('Paso 3 listo');
    });

    it('actualiza el verificador físico de cartas siguientes y guarda la finalización en cookies', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-1', Lesson1);
      const page = harness.routeNativeElement;

      // Por defecto muestra Posición 1 (K♦ abajo -> empieza en 9 de Picas, 5 de Corazones, As de Tréboles)
      expect(page?.querySelector('.checker-result')?.textContent).toContain('9 de Picas');
      expect(page?.querySelector('.checker-result')?.textContent).toContain('5 de Corazones');

      // Al pulsar «Recién volteada (K♠ abajo)», muestra 9 de Corazones, 5 de Tréboles, As de Diamantes
      const freshBtn = Array.from(
        page?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((btn) => btn.textContent?.includes('Recién volteada'));
      freshBtn?.click();
      harness.detectChanges();

      expect(page?.querySelector('.checker-result')?.textContent).toContain('9 de Corazones');
      expect(page?.querySelector('.checker-result')?.textContent).toContain('5 de Tréboles');
      expect(page?.querySelector('.checker-result')?.textContent).toContain('As de Diamantes');

      const completeBtn = Array.from(
        page?.querySelectorAll<HTMLButtonElement>('button') ?? [],
      ).find((btn) => btn.textContent?.includes('Completar Lección 1'));
      expect(completeBtn).toBeTruthy();
      completeBtn?.click();
      harness.detectChanges();

      expect(doc.cookie).toContain(`${COMPLETED_LESSONS_COOKIE}=leccion-1`);
      expect(page?.textContent).toContain('Lección 1 completada');
    });
  });
});

