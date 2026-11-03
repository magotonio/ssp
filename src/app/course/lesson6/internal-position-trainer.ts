import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Icon } from '../../icon';
import {
  CARD_RANK_BY_VALUE,
  CARD_RANKS,
  CardRankMeta,
  CardValue,
  SspCard,
  SuitCode,
} from '../../ssp/ssp-stack';
import { formatStopwatchTime } from '../lesson4/next-card-trainer';
import {
  describeKingdomClassification,
  getCardKingdom,
  KINGDOM_BY_SUIT,
  KingdomClassificationDetail,
  KingdomMeta,
} from '../lesson5/kingdom-trainer';

export type InternalPositionNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export type MathAdjustmentKind = 'direct' | 'minus13' | 'minus26';

export type MnemonicCategoryId = 'direct-x3' | 'extremes' | 'associations';

export type KingdomOffsetValue = 0 | 13 | 26 | 39;

export interface InternalPositionRuleMeta {
  readonly value: CardValue;
  readonly rank: string;
  readonly displayName: string;
  readonly internalPosition: InternalPositionNumber;
  readonly ordinalLabel: string;
  readonly rawProduct: number;
  readonly mathAdjustment: MathAdjustmentKind;
  readonly shortMathLabel: string;
  readonly mathFormulaText: string;
  readonly mnemonicCategory: MnemonicCategoryId;
  readonly mnemonicTag: string;
  readonly mnemonicRule: string;
  readonly hintOnMiss: string;
}

export interface AbsolutePositionBreakdown {
  readonly card: SspCard;
  readonly kingdomDetail: KingdomClassificationDetail;
  readonly kingdom: KingdomMeta;
  readonly offset: KingdomOffsetValue;
  readonly offsetLabel: string;
  readonly internalRule: InternalPositionRuleMeta;
  readonly internalPosition: InternalPositionNumber;
  readonly absolutePosition: number;
  readonly sumFormulaText: string;
}

export interface InternalPositionTrainerFeedback {
  readonly kind: 'hit' | 'miss';
  readonly heading: string;
  readonly detail: string;
}

export const INTERNAL_CYCLE_SIZE = 13;

export const INTERNAL_POSITIONS: readonly InternalPositionNumber[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
] as const;

export const KINGDOM_OFFSET_BY_SUIT: Readonly<Record<SuitCode, KingdomOffsetValue>> = {
  P: 0,
  C: 13,
  T: 26,
  D: 39,
};

/**
 * Calcula matemáticamente la posición interna (1 al 13) de cualquier índice (valor 1 al 13)
 * dentro de su reino mediante la fórmula del × 3 ajustada módulo 13.
 */
export function getInternalPosition(value: CardValue): InternalPositionNumber {
  const product = value * 3;
  if (product <= 13) {
    return product as InternalPositionNumber;
  }
  if (product <= 26) {
    return (product - 13) as InternalPositionNumber;
  }
  return (product - 26) as InternalPositionNumber;
}

/**
 * Devuelve el desfase de posiciones (+0, +13, +26 o +39) asociado al reino de un palo.
 */
export function getKingdomOffset(kingdomSuit: SuitCode): KingdomOffsetValue {
  return KINGDOM_OFFSET_BY_SUIT[kingdomSuit];
}

export const INTERNAL_POSITION_RULES: readonly InternalPositionRuleMeta[] = [
  {
    value: 1,
    rank: 'A',
    displayName: 'As (A)',
    internalPosition: 3,
    ordinalLabel: '3.ª',
    rawProduct: 3,
    mathAdjustment: 'direct',
    shortMathLabel: '1 × 3',
    mathFormulaText: '1 × 3 = 3',
    mnemonicCategory: 'direct-x3',
    mnemonicTag: 'Directo × 3',
    mnemonicRule: 'Del As al 4 se calcula al instante multiplicando por 3: 1 × 3 = 3.ª posición.',
    hintOnMiss: 'Pista: El As vale 1. En las cartas bajas (A–4) basta multiplicar por 3 directamente (1 × 3).',
  },
  {
    value: 2,
    rank: '2',
    displayName: '2',
    internalPosition: 6,
    ordinalLabel: '6.ª',
    rawProduct: 6,
    mathAdjustment: 'direct',
    shortMathLabel: '2 × 3',
    mathFormulaText: '2 × 3 = 6',
    mnemonicCategory: 'direct-x3',
    mnemonicTag: 'Directo × 3',
    mnemonicRule: 'Del As al 4 se calcula al instante multiplicando por 3: 2 × 3 = 6.ª posición.',
    hintOnMiss: 'Pista: En las cartas del As al 4 multiplicas directamente su valor por 3 (2 × 3).',
  },
  {
    value: 3,
    rank: '3',
    displayName: '3',
    internalPosition: 9,
    ordinalLabel: '9.ª',
    rawProduct: 9,
    mathAdjustment: 'direct',
    shortMathLabel: '3 × 3',
    mathFormulaText: '3 × 3 = 9',
    mnemonicCategory: 'direct-x3',
    mnemonicTag: 'Directo × 3',
    mnemonicRule: 'Del As al 4 se calcula al instante multiplicando por 3: 3 × 3 = 9.ª posición.',
    hintOnMiss: 'Pista: En las cartas del As al 4 multiplicas directamente su valor por 3 (3 × 3).',
  },
  {
    value: 4,
    rank: '4',
    displayName: '4',
    internalPosition: 12,
    ordinalLabel: '12.ª',
    rawProduct: 12,
    mathAdjustment: 'direct',
    shortMathLabel: '4 × 3',
    mathFormulaText: '4 × 3 = 12',
    mnemonicCategory: 'direct-x3',
    mnemonicTag: 'Directo × 3',
    mnemonicRule: 'Del As al 4 se calcula al instante multiplicando por 3: 4 × 3 = 12.ª posición.',
    hintOnMiss: 'Pista: En las cartas del As al 4 multiplicas directamente su valor por 3 (4 × 3).',
  },
  {
    value: 5,
    rank: '5',
    displayName: '5',
    internalPosition: 2,
    ordinalLabel: '2.ª',
    rawProduct: 15,
    mathAdjustment: 'minus13',
    shortMathLabel: '15 − 13',
    mathFormulaText: '5 × 3 = 15 → 15 − 13 = 2',
    mnemonicCategory: 'associations',
    mnemonicTag: 'Reflejo del 2',
    mnemonicRule: 'El 5 se parece gráficamente al número 2 en espejo / reflejado → 2.ª posición.',
    hintOnMiss: 'Pista mnemotécnica: mira la silueta del 5 como un reflejo especular de otro dígito (o calcula 15 − 13).',
  },
  {
    value: 6,
    rank: '6',
    displayName: '6',
    internalPosition: 5,
    ordinalLabel: '5.ª',
    rawProduct: 18,
    mathAdjustment: 'minus13',
    shortMathLabel: '18 − 13',
    mathFormulaText: '6 × 3 = 18 → 18 − 13 = 5',
    mnemonicCategory: 'associations',
    mnemonicTag: 'Se queda corto',
    mnemonicRule: 'En el par 6 y 7, el 6 «se queda corto» por uno: 5.ª posición en vez de 6.ª.',
    hintOnMiss: 'Pista mnemotécnica: recuerda la pareja 6 y 7; el 6 «se queda corto» respecto a su propio número (o haz 18 − 13).',
  },
  {
    value: 7,
    rank: '7',
    displayName: '7',
    internalPosition: 8,
    ordinalLabel: '8.ª',
    rawProduct: 21,
    mathAdjustment: 'minus13',
    shortMathLabel: '21 − 13',
    mathFormulaText: '7 × 3 = 21 → 21 − 13 = 8',
    mnemonicCategory: 'associations',
    mnemonicTag: 'Se pasa',
    mnemonicRule: 'En el par 6 y 7, el 7 «se pasa» por uno: 8.ª posición en vez de 7.ª.',
    hintOnMiss: 'Pista mnemotécnica: recuerda la pareja 6 y 7; el 7 «se pasa» una posición respecto a su número (o haz 21 − 13).',
  },
  {
    value: 8,
    rank: '8',
    displayName: '8',
    internalPosition: 11,
    ordinalLabel: '11.ª',
    rawProduct: 24,
    mathAdjustment: 'minus13',
    shortMathLabel: '24 − 13',
    mathFormulaText: '8 × 3 = 24 → 24 − 13 = 11',
    mnemonicCategory: 'associations',
    mnemonicTag: '"Muñeco de nieve" (11)',
    mnemonicRule:
      'El 8 está formado por dos círculos superpuestos que recuerdan a un muñeco de nieve (2 bolas). Como el número 11 se compone de dos unos (2 elementos), conectamos un par con el otro par → 11.ª posición.',
    hintOnMiss:
      'Pista mnemotécnica: el 8 son 2 bolas ("Muñeco de nieve") que conectamos con el otro par de elementos (los dos unos del 11), o calcula 24 − 13.',
  },
  {
    value: 9,
    rank: '9',
    displayName: '9',
    internalPosition: 1,
    ordinalLabel: '1.ª',
    rawProduct: 27,
    mathAdjustment: 'minus26',
    shortMathLabel: '27 − 26',
    mathFormulaText: '9 × 3 = 27 → 27 − 26 = 1',
    mnemonicCategory: 'extremes',
    mnemonicTag: 'Inicio de reino',
    mnemonicRule: 'Extremo conocido: el 9 abre siempre cada reino (igual que el 9♠ inicia la baraja) → 1.ª posición.',
    hintOnMiss: 'Pista: el 9 es uno de los dos extremos fijos de cada bloque; recuerda con qué índice arranca la baraja (27 − 26).',
  },
  {
    value: 10,
    rank: '10',
    displayName: '10',
    internalPosition: 4,
    ordinalLabel: '4.ª',
    rawProduct: 30,
    mathAdjustment: 'minus26',
    shortMathLabel: '30 − 26',
    mathFormulaText: '10 × 3 = 30 → 30 − 26 = 4',
    mnemonicCategory: 'associations',
    mnemonicTag: '«DIEZ» = 4 letras',
    mnemonicRule: 'La palabra «DIEZ» tiene exactamente 4 letras (D-I-E-Z) → 4.ª posición.',
    hintOnMiss: 'Pista mnemotécnica: cuenta cuántas letras tiene la palabra «DIEZ» (o calcula 30 − 26).',
  },
  {
    value: 11,
    rank: 'J',
    displayName: 'Sota (J / 11)',
    internalPosition: 7,
    ordinalLabel: '7.ª',
    rawProduct: 33,
    mathAdjustment: 'minus26',
    shortMathLabel: '33 − 26',
    mathFormulaText: '11 × 3 = 33 → 33 − 26 = 7',
    mnemonicCategory: 'associations',
    mnemonicTag: 'Forma y sonido del 7',
    mnemonicRule: 'Tanto por sonido como por su forma gráfica, la J (Sota) se asocia al 7 → 7.ª posición.',
    hintOnMiss: 'Pista mnemotécnica: fíjate en la forma gráfica y sonoridad de la J / Sota (o calcula 33 − 26).',
  },
  {
    value: 12,
    rank: 'Q',
    displayName: 'Reina (Q / 12)',
    internalPosition: 10,
    ordinalLabel: '10.ª',
    rawProduct: 36,
    mathAdjustment: 'minus26',
    shortMathLabel: '36 − 26',
    mathFormulaText: '12 × 3 = 36 → 36 − 26 = 10',
    mnemonicCategory: 'associations',
    mnemonicTag: 'La «chica 10»',
    mnemonicRule: 'La Reina (Q) es la «chica 10» → 10.ª posición.',
    hintOnMiss: 'Pista mnemotécnica: la Reina (Q) se recuerda como la «chica …» (o calcula 36 − 26).',
  },
  {
    value: 13,
    rank: 'K',
    displayName: 'Rey (K / 13)',
    internalPosition: 13,
    ordinalLabel: '13.ª',
    rawProduct: 39,
    mathAdjustment: 'minus26',
    shortMathLabel: '39 − 26',
    mathFormulaText: '13 × 3 = 39 → 39 − 26 = 13',
    mnemonicCategory: 'extremes',
    mnemonicTag: 'Cierre de reino',
    mnemonicRule: 'Extremo conocido: el Rey (K) cierra siempre cada bloque de 13 cartas → 13.ª posición.',
    hintOnMiss: 'Pista: el Rey (K, valor 13) es el extremo final que cierra cada reino (39 − 26).',
  },
] as const;

export const INTERNAL_RULE_BY_VALUE: Readonly<Record<CardValue, InternalPositionRuleMeta>> = {
  1: INTERNAL_POSITION_RULES[0],
  2: INTERNAL_POSITION_RULES[1],
  3: INTERNAL_POSITION_RULES[2],
  4: INTERNAL_POSITION_RULES[3],
  5: INTERNAL_POSITION_RULES[4],
  6: INTERNAL_POSITION_RULES[5],
  7: INTERNAL_POSITION_RULES[6],
  8: INTERNAL_POSITION_RULES[7],
  9: INTERNAL_POSITION_RULES[8],
  10: INTERNAL_POSITION_RULES[9],
  11: INTERNAL_POSITION_RULES[10],
  12: INTERNAL_POSITION_RULES[11],
  13: INTERNAL_POSITION_RULES[12],
};

/**
 * Combina la clasificación del reino (Lección 5) con la posición interna (Lección 6)
 * para desglosar la posición exacta del 1 al 52 de cualquier carta de la baraja.
 */
export function describeAbsolutePosition(card: SspCard): AbsolutePositionBreakdown {
  const kingdomDetail = describeKingdomClassification(card);
  const kingdom = getCardKingdom(card);
  const offset = getKingdomOffset(kingdom.suit);
  const internalRule = INTERNAL_RULE_BY_VALUE[card.value];
  const internalPosition = getInternalPosition(card.value);
  const absolutePosition = internalPosition + offset;
  const offsetLabel = `+${offset}`;

  return {
    card,
    kingdomDetail,
    kingdom,
    offset,
    offsetLabel,
    internalRule,
    internalPosition,
    absolutePosition,
    sumFormulaText: `${internalPosition} (${card.rank}) + ${offset} (${KINGDOM_BY_SUIT[kingdom.suit].displaySuitLabel}) = ${absolutePosition}`,
  };
}

export function shuffleCardValues(
  ranks: readonly CardRankMeta[] = CARD_RANKS,
  randomFn: () => number = Math.random,
): readonly CardValue[] {
  const copy = ranks.map((item) => item.value);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const averageSecondsFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

@Component({
  selector: 'app-internal-position-trainer',
  imports: [Icon],
  templateUrl: './internal-position-trainer.html',
  styleUrl: './internal-position-trainer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalPositionTrainer {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cycleSize = INTERNAL_CYCLE_SIZE;
  protected readonly positions = INTERNAL_POSITIONS;

  readonly sequence = signal<readonly CardValue[]>(shuffleCardValues());
  readonly currentIndex = signal<number>(0);
  readonly isCycleCompleted = signal<boolean>(false);
  readonly hits = signal<number>(0);
  readonly misses = signal<number>(0);
  readonly failedPositions = signal<readonly InternalPositionNumber[]>([]);
  readonly feedback = signal<InternalPositionTrainerFeedback | null>(null);
  readonly elapsedMs = signal<number>(0);
  readonly isTimerRunning = signal<boolean>(false);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private runStartedAtMs = 0;
  private accumulatedMs = 0;

  protected readonly currentValue = computed<CardValue>(
    () => this.sequence()[this.currentIndex()] ?? 1,
  );

  protected readonly currentRankMeta = computed<CardRankMeta>(
    () => CARD_RANK_BY_VALUE[this.currentValue()],
  );

  protected readonly currentRule = computed<InternalPositionRuleMeta>(
    () => INTERNAL_RULE_BY_VALUE[this.currentValue()],
  );

  protected readonly stepNumber = computed<number>(() =>
    this.isCycleCompleted() ? INTERNAL_CYCLE_SIZE : this.currentIndex() + 1,
  );

  protected readonly progressPercent = computed<number>(() =>
    Math.round((this.hits() / INTERNAL_CYCLE_SIZE) * 100),
  );

  protected readonly formattedTime = computed<string>(() =>
    formatStopwatchTime(this.elapsedMs()),
  );

  protected readonly averageSecondsPerIndex = computed<string>(() => {
    const seconds = this.elapsedMs() / 1000 / INTERNAL_CYCLE_SIZE;
    return averageSecondsFormatter.format(seconds);
  });

  protected readonly totalAttempts = computed<number>(() => this.hits() + this.misses());

  protected readonly accuracyPercent = computed<number | null>(() => {
    const total = this.totalAttempts();
    if (total === 0) {
      return null;
    }
    return Math.round((this.hits() / total) * 100);
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearTimerInterval();
    });
  }

  toggleTimer(): void {
    if (this.isCycleCompleted()) {
      return;
    }
    if (this.isTimerRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(): void {
    if (this.isTimerRunning() || this.isCycleCompleted()) {
      return;
    }
    this.runStartedAtMs = Date.now();
    this.isTimerRunning.set(true);
    this.clearTimerInterval();
    this.intervalId = setInterval(() => {
      this.elapsedMs.set(this.accumulatedMs + (Date.now() - this.runStartedAtMs));
    }, 200);
  }

  pauseTimer(): void {
    if (!this.isTimerRunning()) {
      return;
    }
    const now = Date.now();
    this.accumulatedMs += Math.max(0, now - this.runStartedAtMs);
    this.elapsedMs.set(this.accumulatedMs);
    this.isTimerRunning.set(false);
    this.clearTimerInterval();
  }

  selectPosition(chosenPosition: InternalPositionNumber): void {
    if (!this.isTimerRunning() || this.isCycleCompleted()) {
      return;
    }

    const rule = this.currentRule();

    if (chosenPosition === rule.internalPosition) {
      this.hits.update((count) => count + 1);
      this.failedPositions.set([]);

      const confirmationDetail = `${rule.mnemonicRule} (Fórmula: ${rule.mathFormulaText}).`;

      if (this.currentIndex() >= this.sequence().length - 1) {
        this.pauseTimer();
        this.isCycleCompleted.set(true);
        this.feedback.set({
          kind: 'hit',
          heading: `¡Ciclo de 13 índices superado! Último acierto: ${rule.displayName} → ${rule.ordinalLabel} posición.`,
          detail: confirmationDetail,
        });
      } else {
        this.currentIndex.update((idx) => idx + 1);
        this.feedback.set({
          kind: 'hit',
          heading: `¡Acierto! El índice ${rule.displayName} ocupa la ${rule.ordinalLabel} posición de su reino.`,
          detail: confirmationDetail,
        });
      }
      return;
    }

    this.misses.update((count) => count + 1);
    this.failedPositions.update((prev) =>
      prev.includes(chosenPosition) ? prev : [...prev, chosenPosition],
    );
    this.feedback.set({
      kind: 'miss',
      heading: `¡Fallo! El índice ${rule.displayName} no ocupa la ${chosenPosition}.ª posición. Inténtalo de nuevo.`,
      detail: rule.hintOnMiss,
    });
  }

  resetCycle(): void {
    this.clearTimerInterval();
    this.isTimerRunning.set(false);
    this.runStartedAtMs = 0;
    this.accumulatedMs = 0;
    this.elapsedMs.set(0);
    this.sequence.set(shuffleCardValues());
    this.currentIndex.set(0);
    this.isCycleCompleted.set(false);
    this.hits.set(0);
    this.misses.set(0);
    this.failedPositions.set([]);
    this.feedback.set(null);
  }

  setSequenceForTesting(values: readonly CardValue[], initialElapsedMs = 0): void {
    this.clearTimerInterval();
    this.isTimerRunning.set(false);
    this.runStartedAtMs = 0;
    this.accumulatedMs = initialElapsedMs;
    this.elapsedMs.set(initialElapsedMs);
    this.sequence.set([...values]);
    this.currentIndex.set(0);
    this.isCycleCompleted.set(false);
    this.hits.set(0);
    this.misses.set(0);
    this.failedPositions.set([]);
    this.feedback.set(null);
  }

  protected isFailedPosition(pos: InternalPositionNumber): boolean {
    return this.failedPositions().includes(pos);
  }

  private clearTimerInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

