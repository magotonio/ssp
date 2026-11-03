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
  CardValue,
  DECK_SIZE,
  getNextSuit,
  SSP_STACK,
  SspCard,
  SUIT_BY_CODE,
  SUIT_CYCLE,
  SuitCode,
} from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';
import {
  formatStopwatchTime,
  getCardDeckInkHex,
  shuffleSspDeck,
} from '../lesson4/next-card-trainer';

export type KingdomCharacterId = 'noble' | 'politician' | 'scientist';

export interface KingdomMeta {
  readonly order: 1 | 2 | 3 | 4;
  readonly ordinalLabel: string;
  readonly shortOrdinal: string;
  readonly suit: SuitCode;
  readonly name: string;
  readonly displaySuitLabel: string;
  readonly startPosition: number;
  readonly endPosition: number;
  readonly rangeLabel: string;
  readonly inkHex: string;
}

export interface KingdomCharacterMeta {
  readonly id: KingdomCharacterId;
  readonly singularName: string;
  readonly pluralName: string;
  readonly ranksLabel: string;
  readonly motto: string;
  readonly badgeBg: string;
  readonly badgeText: string;
}

export interface KingdomClassificationDetail {
  readonly character: KingdomCharacterMeta;
  readonly kingdom: KingdomMeta;
  readonly explanation: string;
  readonly hintOnMiss: string;
}

export interface KingdomTrainerFeedback {
  readonly kind: 'hit' | 'miss';
  readonly heading: string;
  readonly detail: string;
}

export const KINGDOMS: readonly KingdomMeta[] = [
  {
    order: 1,
    ordinalLabel: 'Primer reino',
    shortOrdinal: '1.º',
    suit: 'P',
    name: 'Reino de Picas',
    displaySuitLabel: 'Picas',
    startPosition: 1,
    endPosition: 13,
    rangeLabel: 'Cartas 1 a 13',
    inkHex: '#18181b',
  },
  {
    order: 2,
    ordinalLabel: 'Segundo reino',
    shortOrdinal: '2.º',
    suit: 'C',
    name: 'Reino de Corazones',
    displaySuitLabel: 'Corazones',
    startPosition: 14,
    endPosition: 26,
    rangeLabel: 'Cartas 14 a 26',
    inkHex: '#e11d48',
  },
  {
    order: 3,
    ordinalLabel: 'Tercer reino',
    shortOrdinal: '3.º',
    suit: 'T',
    name: 'Reino de Tréboles',
    displaySuitLabel: 'Tréboles',
    startPosition: 27,
    endPosition: 39,
    rangeLabel: 'Cartas 27 a 39',
    inkHex: '#18181b',
  },
  {
    order: 4,
    ordinalLabel: 'Cuarto reino',
    shortOrdinal: '4.º',
    suit: 'D',
    name: 'Reino de Diamantes',
    displaySuitLabel: 'Diamantes / Rombos',
    startPosition: 40,
    endPosition: 52,
    rangeLabel: 'Cartas 40 a 52',
    inkHex: '#e11d48',
  },
] as const;

export const KINGDOM_BY_SUIT: Readonly<Record<SuitCode, KingdomMeta>> = {
  P: KINGDOMS[0],
  C: KINGDOMS[1],
  T: KINGDOMS[2],
  D: KINGDOMS[3],
};

export const KINGDOM_CHARACTER_BY_ID: Readonly<Record<KingdomCharacterId, KingdomCharacterMeta>> = {
  noble: {
    id: 'noble',
    singularName: 'Noble',
    pluralName: 'Los Nobles',
    ranksLabel: '9, 10, J, Q y K',
    motto: 'Dicen la verdad',
    badgeBg: '#edf2eb',
    badgeText: '#397153',
  },
  politician: {
    id: 'politician',
    singularName: 'Político',
    pluralName: 'Los Políticos',
    ranksLabel: 'As, 2, 3 y 4',
    motto: 'Mienten en el palo, no en el color',
    badgeBg: '#fdf0e5',
    badgeText: '#9c4c1f',
  },
  scientist: {
    id: 'scientist',
    singularName: 'Científico',
    pluralName: 'Los Científicos',
    ranksLabel: '5, 6, 7 y 8',
    motto: 'Van adelantados a su época',
    badgeBg: '#f0eef9',
    badgeText: '#5b4b8a',
  },
};

/**
 * Devuelve el palo inmediatamente anterior en el ciclo canónico P -> C -> T -> D.
 */
export function getPreviousSuit(suit: SuitCode): SuitCode {
  const index = SUIT_CYCLE.indexOf(suit);
  return SUIT_CYCLE[(index + 3) % 4];
}

export function getCardCharacterId(value: CardValue): KingdomCharacterId {
  if (value >= 9) {
    return 'noble';
  }
  if (value <= 4) {
    return 'politician';
  }
  return 'scientist';
}

export function getCardCharacter(value: CardValue): KingdomCharacterMeta {
  return KINGDOM_CHARACTER_BY_ID[getCardCharacterId(value)];
}

/**
 * Determina el palo del reino al que pertenece una carta según su categoría:
 * - Nobles (9..K): mismo palo.
 * - Políticos (A..4): otro palo del mismo color (+2 en el ciclo).
 * - Científicos (5..8): palo anterior en el ciclo canónico P -> C -> T -> D.
 */
export function getCardKingdomSuit(card: Pick<SspCard, 'value' | 'suit'>): SuitCode {
  const characterId = getCardCharacterId(card.value);
  if (characterId === 'noble') {
    return card.suit;
  }
  if (characterId === 'politician') {
    return getNextSuit(card.suit, 2);
  }
  return getPreviousSuit(card.suit);
}

export function getCardKingdom(card: Pick<SspCard, 'value' | 'suit'>): KingdomMeta {
  return KINGDOM_BY_SUIT[getCardKingdomSuit(card)];
}

export function describeKingdomClassification(card: SspCard): KingdomClassificationDetail {
  const character = getCardCharacter(card.value);
  const kingdom = getCardKingdom(card);

  if (character.id === 'noble') {
    return {
      character,
      kingdom,
      explanation: `Noble (${card.rank} está del 9 al Rey): «dice la verdad», por lo que se ubica en el reino de su propio palo (${kingdom.name}, posiciones ${kingdom.startPosition}–${kingdom.endPosition}).`,
      hintOnMiss: `Pista: El ${card.valueName} es un Noble (del 9 al Rey). Los Nobles «dicen la verdad» y están en el reino que coincide con su propio palo.`,
    };
  }

  if (character.id === 'politician') {
    const colorWord = card.suit === 'P' || card.suit === 'T' ? 'negro' : 'rojo';
    return {
      character,
      kingdom,
      explanation: `Político (${card.rank} es carta baja, As–4): «miente» sobre su palo y solo dice la verdad sobre el color ${colorWord} → pasa a su palo homólogo (${kingdom.name}, posiciones ${kingdom.startPosition}–${kingdom.endPosition}).`,
      hintOnMiss: `Pista: El ${card.valueName} es un Político (As, 2, 3 o 4). Los Políticos «mienten» sobre su palo exacto y solo dicen la verdad sobre el color ${colorWord}: elige el otro reino ${colorWord}.`,
    };
  }

  const cardSuitPlural = SUIT_BY_CODE[card.suit].pluralName;
  return {
    character,
    kingdom,
    explanation: `Científico (${card.rank} es carta intermedia, 5–8): va «adelantado a su época» → se ubica en el reino que antecede a ${cardSuitPlural} en Picas → Corazones → Tréboles → Diamantes (${kingdom.name}, posiciones ${kingdom.startPosition}–${kingdom.endPosition}).`,
    hintOnMiss: `Pista: El ${card.rank} es un Científico (5, 6, 7 u 8). Va «adelantado a su época»: busca el reino que antecede a ${cardSuitPlural} en el ciclo Picas → Corazones → Tréboles → Diamantes.`,
  };
}

const averageSecondsFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

@Component({
  selector: 'app-kingdom-trainer',
  imports: [Icon, SuitIcon],
  templateUrl: './kingdom-trainer.html',
  styleUrl: './kingdom-trainer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KingdomTrainer {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly deckSize = DECK_SIZE;
  protected readonly kingdoms = KINGDOMS;

  readonly deck = signal<readonly SspCard[]>(shuffleSspDeck());
  readonly currentIndex = signal<number>(0);
  readonly isCycleCompleted = signal<boolean>(false);
  readonly hits = signal<number>(0);
  readonly misses = signal<number>(0);
  readonly feedback = signal<KingdomTrainerFeedback | null>(null);
  readonly elapsedMs = signal<number>(0);
  readonly isTimerRunning = signal<boolean>(false);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private runStartedAtMs = 0;
  private accumulatedMs = 0;

  protected readonly currentCard = computed<SspCard>(
    () => this.deck()[this.currentIndex()] ?? SSP_STACK[0],
  );

  protected readonly currentCardInkHex = computed<string>(() =>
    getCardDeckInkHex(this.currentCard().suit),
  );

  protected readonly cardStepNumber = computed<number>(() =>
    this.isCycleCompleted() ? DECK_SIZE : this.currentIndex() + 1,
  );

  protected readonly progressPercent = computed<number>(() =>
    Math.round((this.hits() / DECK_SIZE) * 100),
  );

  protected readonly formattedTime = computed<string>(() =>
    formatStopwatchTime(this.elapsedMs()),
  );

  protected readonly averageSecondsPerCard = computed<string>(() => {
    const seconds = this.elapsedMs() / 1000 / DECK_SIZE;
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

  selectKingdom(chosenSuit: SuitCode): void {
    if (!this.isTimerRunning() || this.isCycleCompleted()) {
      return;
    }

    const promptCard = this.currentCard();
    const detail = describeKingdomClassification(promptCard);
    const chosenKingdom = KINGDOM_BY_SUIT[chosenSuit];

    if (chosenSuit === detail.kingdom.suit) {
      this.hits.update((count) => count + 1);

      if (this.currentIndex() >= this.deck().length - 1) {
        this.pauseTimer();
        this.isCycleCompleted.set(true);
        this.feedback.set({
          kind: 'hit',
          heading: `¡Ciclo completo superado! Último acierto: ${promptCard.fullName} → ${detail.kingdom.name} (${detail.kingdom.rangeLabel.toLowerCase()}).`,
          detail: detail.explanation,
        });
      } else {
        this.currentIndex.update((idx) => idx + 1);
        this.feedback.set({
          kind: 'hit',
          heading: `¡Acierto! El ${promptCard.fullName} está en el ${detail.kingdom.name} (${detail.kingdom.rangeLabel.toLowerCase()}).`,
          detail: detail.explanation,
        });
      }
      return;
    }

    this.misses.update((count) => count + 1);
    this.feedback.set({
      kind: 'miss',
      heading: `¡Fallo! El ${promptCard.fullName} no pertenece al ${chosenKingdom.name}. Inténtalo de nuevo.`,
      detail: detail.hintOnMiss,
    });
  }

  resetCycle(): void {
    this.clearTimerInterval();
    this.isTimerRunning.set(false);
    this.runStartedAtMs = 0;
    this.accumulatedMs = 0;
    this.elapsedMs.set(0);
    this.deck.set(shuffleSspDeck());
    this.currentIndex.set(0);
    this.isCycleCompleted.set(false);
    this.hits.set(0);
    this.misses.set(0);
    this.feedback.set(null);
  }

  setDeckForTesting(cards: readonly SspCard[], initialElapsedMs = 0): void {
    this.clearTimerInterval();
    this.isTimerRunning.set(false);
    this.runStartedAtMs = 0;
    this.accumulatedMs = initialElapsedMs;
    this.elapsedMs.set(initialElapsedMs);
    this.deck.set([...cards]);
    this.currentIndex.set(0);
    this.isCycleCompleted.set(false);
    this.hits.set(0);
    this.misses.set(0);
    this.feedback.set(null);
  }

  private clearTimerInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

