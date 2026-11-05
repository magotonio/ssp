import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { DECK_SIZE, SSP_STACK } from '../../ssp/ssp-stack';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course-progress.service';
import { Lesson8 } from './lesson8';
import {
  buildSeventeenPiles,
  cardAtPosition,
  forwardDistance,
  internalPositionByTimesThree,
  nextValueSameSuitPosition,
  parityOfIndexPlusSuit,
  suitColor,
} from './principles/principle-helpers';
import { PRINCIPLES } from './principles/principles';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Lección 8 · Los 13 principios', () => {
  describe('Verificación de los principios contra la ordenación normativa', () => {
    const range = Array.from({ length: DECK_SIZE }, (_, i) => i + 1);

    it('registra 13 principios numerados y con componente propio', () => {
      expect(PRINCIPLES.map((p) => p.number)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
      expect(new Set(PRINCIPLES.map((p) => p.component)).size).toBe(13);
    });

    it('P3 y P4: a 13 y 26 cartas reaparece el índice con 1 y 2 palos de avance', () => {
      for (const n of range) {
        const a = cardAtPosition(n);
        expect(cardAtPosition(n + 13).value).toBe(a.value);
        expect(cardAtPosition(n + 26).value).toBe(a.value);
        expect(suitColor(cardAtPosition(n + 26).suit)).toBe(suitColor(a.suit));
      }
    });

    it('P7: el ×3 en módulo 13 coincide con la posición dentro del reino', () => {
      for (const n of range) {
        const card = cardAtPosition(n);
        expect(internalPositionByTimesThree(card.value)).toBe(((n - 1) % 13) + 1);
      }
    });

    it('P8: mismo palo e índice consecutivo a 3 posiciones (salvo del Rey al As)', () => {
      for (const card of SSP_STACK) {
        const target = nextValueSameSuitPosition(card);
        if (card.value === 13) {
          expect(target).toBeNull();
        } else {
          expect(forwardDistance(card.position, target as number)).toBe(3);
        }
      }
    });

    it('P9 y P10: la paridad alterna y los tríos tienen 3 palos distintos', () => {
      for (const n of range) {
        expect(parityOfIndexPlusSuit(cardAtPosition(n))).not.toBe(
          parityOfIndexPlusSuit(cardAtPosition(n + 1)),
        );
        const suits = [0, 1, 2].map((i) => cardAtPosition(n + i).suit);
        expect(new Set(suits).size).toBe(3);
      }
    });

    it('P11: la suma de tres valores consecutivos menos 14 es la posición interna de la primera', () => {
      for (const n of range) {
        const sum = [0, 1, 2].reduce((t, i) => t + cardAtPosition(n + i).value, 0);
        expect(sum - 14).toBe(((n - 1) % 13) + 1);
      }
    });

    it('P12: sin As, 2, 3 y 4 los colores alternan en bucle cerrado', () => {
      const kept = SSP_STACK.filter((c) => c.value > 4);
      expect(kept).toHaveLength(36);
      kept.forEach((card, i) => {
        expect(suitColor(card.suit)).not.toBe(suitColor(kept[(i + 1) % kept.length].suit));
      });
    });

    it('P13: los 17 montones recogidos reproducen la ordenación SSP (cíclicamente)', () => {
      const { piles, gathered } = buildSeventeenPiles();
      expect(piles).toHaveLength(17);
      expect(gathered).toHaveLength(DECK_SIZE);
      const offset = gathered[0].position - 1;
      gathered.forEach((card, i) => {
        expect(card.position).toBe(((offset + i) % DECK_SIZE) + 1);
      });
    });
  });

  describe('Pantalla interactiva (/curso/leccion-8)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      clearCourseCookies(TestBed.inject(DOCUMENT));
    });

    afterEach(() => clearCourseCookies(TestBed.inject(DOCUMENT)));

    it('muestra un solo principio cada vez y permite navegar entre ellos', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-8', Lesson8);
      const page = harness.routeNativeElement;

      expect(doc.cookie).toContain(`${CURRENT_LESSON_COOKIE}=leccion-8`);
      expect(page?.querySelector('#principio-actual')?.textContent).toContain('Naturaleza cíclica');
      expect(page?.querySelector('app-principle-01-cyclic')).toBeTruthy();
      expect(page?.querySelector('app-principle-02-next-card')).toBeNull();

      const next = Array.from(page?.querySelectorAll<HTMLButtonElement>('button') ?? []).find((b) =>
        b.textContent?.includes('Siguiente'),
      );
      next?.click();
      harness.detectChanges();

      expect(page?.querySelector('#principio-actual')?.textContent).toContain(
        'Regla de la carta siguiente',
      );
      expect(page?.querySelector('app-principle-01-cyclic')).toBeNull();
      expect(page?.querySelector('app-principle-02-next-card')).toBeTruthy();

      page
        ?.querySelector<HTMLButtonElement>('button[aria-label^="Principio 13"]')
        ?.click();
      harness.detectChanges();
      expect(page?.querySelector('app-principle-13-seventeen-piles')).toBeTruthy();
    });

    it('permite completar la Lección 8', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/leccion-8', Lesson8);
      const page = harness.routeNativeElement;

      Array.from(page?.querySelectorAll<HTMLButtonElement>('button') ?? [])
        .find((b) => b.textContent?.includes('Completar Lección 8'))
        ?.click();
      harness.detectChanges();

      expect(doc.cookie).toContain(`${COMPLETED_LESSONS_COOKIE}=leccion-8`);
      expect(page?.textContent).toContain('Lección 8 completada');
    });
  });
});
