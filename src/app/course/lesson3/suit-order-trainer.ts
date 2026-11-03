import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Icon } from '../../icon';
import { getNextSuit, SUIT_BY_CODE, SUIT_CYCLE, SuitCode, SuitMeta } from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';

export type SuitTrainerMode = 'next' | 'points' | 'steps';

export interface SuitTrainerPrompt {
  readonly suit: SuitCode;
  readonly step: 1 | 2;
  readonly targetOrder: 1 | 2 | 3 | 4;
}

export interface SuitTrainerFeedback {
  readonly kind: 'hit' | 'miss';
  readonly heading: string;
  readonly detail: string;
}

export interface SuitChoiceOption {
  readonly code: SuitCode;
  readonly meta: SuitMeta;
  readonly displayLabel: string;
  readonly inkHex: string;
  readonly pointsHint: string;
}

export const SUIT_CHOICE_OPTIONS: readonly SuitChoiceOption[] = [
  {
    code: 'P',
    meta: SUIT_BY_CODE['P'],
    displayLabel: 'Picas',
    inkHex: '#18181b',
    pointsHint: '1 punta',
  },
  {
    code: 'C',
    meta: SUIT_BY_CODE['C'],
    displayLabel: 'Corazones',
    inkHex: '#e11d48',
    pointsHint: '2 sobresalientes',
  },
  {
    code: 'T',
    meta: SUIT_BY_CODE['T'],
    displayLabel: 'Tréboles',
    inkHex: '#18181b',
    pointsHint: '3 sobresalientes',
  },
  {
    code: 'D',
    meta: SUIT_BY_CODE['D'],
    displayLabel: 'Diamantes (Rombos)',
    inkHex: '#e11d48',
    pointsHint: '4 puntas',
  },
] as const;

const SUIT_BY_POINT_COUNT: Readonly<Record<1 | 2 | 3 | 4, SuitCode>> = {
  1: 'P',
  2: 'C',
  3: 'T',
  4: 'D',
};

const POINT_COUNT_LABEL: Readonly<Record<1 | 2 | 3 | 4, string>> = {
  1: '1 punta aguda',
  2: '2 sobresalientes (curvas)',
  3: '3 sobresalientes (hojas)',
  4: '4 puntas (esquinas)',
};

function pickRandomPrompt(mode: SuitTrainerMode, previous?: SuitTrainerPrompt): SuitTrainerPrompt {
  if (mode === 'points') {
    const orders: readonly (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];
    const candidates = previous
      ? orders.filter((order) => order !== previous.targetOrder)
      : orders;
    const chosenOrder = candidates[Math.floor(Math.random() * candidates.length)];
    return {
      suit: SUIT_BY_POINT_COUNT[chosenOrder],
      step: 1,
      targetOrder: chosenOrder,
    };
  }

  if (mode === 'steps') {
    const allPairs: SuitTrainerPrompt[] = [];
    for (const s of SUIT_CYCLE) {
      for (const st of [1, 2] as const) {
        allPairs.push({ suit: s, step: st, targetOrder: SUIT_BY_CODE[s].order });
      }
    }
    const candidates = previous
      ? allPairs.filter((p) => p.suit !== previous.suit || p.step !== previous.step)
      : allPairs;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const suitCandidates = previous
    ? SUIT_CYCLE.filter((s) => s !== previous.suit)
    : SUIT_CYCLE;
  const chosenSuit = suitCandidates[Math.floor(Math.random() * suitCandidates.length)];
  return {
    suit: chosenSuit,
    step: 1,
    targetOrder: SUIT_BY_CODE[chosenSuit].order,
  };
}

@Component({
  selector: 'app-suit-order-trainer',
  imports: [Icon, SuitIcon],
  templateUrl: './suit-order-trainer.html',
  styleUrl: './suit-order-trainer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuitOrderTrainer {
  protected readonly options = SUIT_CHOICE_OPTIONS;

  readonly mode = signal<SuitTrainerMode>('next');
  readonly prompt = signal<SuitTrainerPrompt>(pickRandomPrompt('next'));
  readonly hits = signal<number>(0);
  readonly misses = signal<number>(0);
  readonly failedSuits = signal<readonly SuitCode[]>([]);
  readonly feedback = signal<SuitTrainerFeedback | null>(null);

  protected readonly promptOption = computed<SuitChoiceOption>(
    () =>
      SUIT_CHOICE_OPTIONS.find((item) => item.code === this.prompt().suit) ??
      SUIT_CHOICE_OPTIONS[0],
  );

  protected readonly pointDescription = computed<string>(
    () => POINT_COUNT_LABEL[this.prompt().targetOrder],
  );

  protected readonly totalAttempts = computed<number>(() => this.hits() + this.misses());

  protected readonly accuracyPercent = computed<number | null>(() => {
    const total = this.totalAttempts();
    if (total === 0) {
      return null;
    }
    return Math.round((this.hits() / total) * 100);
  });

  protected readonly expectedSuit = computed<SuitCode>(() => {
    const current = this.prompt();
    if (this.mode() === 'points') {
      return SUIT_BY_POINT_COUNT[current.targetOrder];
    }
    return getNextSuit(current.suit, current.step);
  });

  setMode(newMode: SuitTrainerMode): void {
    if (this.mode() === newMode) {
      return;
    }
    this.mode.set(newMode);
    this.failedSuits.set([]);
    this.feedback.set(null);
    this.prompt.set(pickRandomPrompt(newMode));
  }

  selectAnswer(selectedSuit: SuitCode): void {
    const currentMode = this.mode();
    const currentPrompt = this.prompt();
    const expected = this.expectedSuit();
    const selectedMeta = SUIT_BY_CODE[selectedSuit];
    const expectedMeta = SUIT_BY_CODE[expected];

    if (selectedSuit === expected) {
      this.hits.update((count) => count + 1);
      this.failedSuits.set([]);

      if (currentMode === 'points') {
        this.feedback.set({
          kind: 'hit',
          heading: `¡Acierto! El palo nº ${currentPrompt.targetOrder} es ${expectedMeta.pluralName}.`,
          detail: `Tiene ${POINT_COUNT_LABEL[currentPrompt.targetOrder]} en la secuencia PI-CO-TRI-DIA.`,
        });
      } else if (currentPrompt.step === 2) {
        const fromMeta = SUIT_BY_CODE[currentPrompt.suit];
        this.feedback.set({
          kind: 'hit',
          heading: `¡Acierto! Avanzando 2 palos desde ${fromMeta.pluralName} llegas a ${expectedMeta.pluralName}.`,
          detail: 'Al avanzar 2 posiciones saltas al palo gemelo del mismo color.',
        });
      } else {
        const fromMeta = SUIT_BY_CODE[currentPrompt.suit];
        this.feedback.set({
          kind: 'hit',
          heading: `¡Acierto! Después de ${fromMeta.pluralName} sigue ${expectedMeta.pluralName}.`,
          detail: `Ciclo: Picas (1) → Corazones (2) → Tréboles (3) → Diamantes (4) → Picas.`,
        });
      }

      this.prompt.set(pickRandomPrompt(currentMode, currentPrompt));
      return;
    }

    this.misses.update((count) => count + 1);
    this.failedSuits.update((prev) =>
      prev.includes(selectedSuit) ? prev : [...prev, selectedSuit],
    );

    let hint: string;
    if (currentMode === 'points') {
      hint = `Pista: busca la figura con ${POINT_COUNT_LABEL[currentPrompt.targetOrder]} (PI-CO-TRI-DIA).`;
    } else if (currentPrompt.step === 2) {
      const fromMeta = SUIT_BY_CODE[currentPrompt.suit];
      hint = `Pista: al sumar +2 desde ${fromMeta.pluralName} debes ir al otro palo de su mismo color.`;
    } else {
      const fromMeta = SUIT_BY_CODE[currentPrompt.suit];
      const nextOrder = (fromMeta.order % 4) + 1;
      hint = `Pista: ${fromMeta.pluralName} es el palo ${fromMeta.order}; el siguiente es el palo ${nextOrder} en PI-CO-TRI-DIA.`;
    }

    this.feedback.set({
      kind: 'miss',
      heading: `¡Fallo! ${selectedMeta.pluralName} no es la respuesta correcta. Prueba de nuevo.`,
      detail: hint,
    });
  }

  resetCounters(): void {
    this.hits.set(0);
    this.misses.set(0);
    this.failedSuits.set([]);
    this.feedback.set(null);
  }

  setPromptForTesting(mode: SuitTrainerMode, prompt: SuitTrainerPrompt): void {
    this.mode.set(mode);
    this.prompt.set(prompt);
    this.failedSuits.set([]);
    this.feedback.set(null);
  }

  protected isFailedOption(code: SuitCode): boolean {
    return this.failedSuits().includes(code);
  }
}

