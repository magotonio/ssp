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
  DECK_SIZE,
  getNextSspCard,
  getSspCardByValueAndSuit,
  SSP_STACK,
  SspCard,
  SUIT_BY_CODE,
  SuitCode,
} from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';
import { describeIndexTransition } from '../lesson2/next-index-trainer';
import { SUIT_CHOICE_OPTIONS, SuitChoiceOption } from '../lesson3/suit-order-trainer';

export interface NextCardTrainerFeedback {
  readonly kind: 'hit' | 'miss';
  readonly heading: string;
  readonly detail: string;
}

export function getCardDeckInkHex(suit: SuitCode): string {
  return suit === 'C' || suit === 'D' ? '#e11d48' : '#18181b';
}

export function shuffleSspDeck(
  cards: readonly SspCard[] = SSP_STACK,
  randomFn: () => number = Math.random,
): readonly SspCard[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function formatStopwatchTime(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

const averageSecondsFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

@Component({
  selector: 'app-next-card-trainer',
  imports: [Icon, SuitIcon],
  templateUrl: './next-card-trainer.html',
  styleUrl: './next-card-trainer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextCardTrainer {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly deckSize = DECK_SIZE;
  protected readonly ranks = CARD_RANKS;
  protected readonly suitOptions: readonly SuitChoiceOption[] = SUIT_CHOICE_OPTIONS;

  readonly deck = signal<readonly SspCard[]>(shuffleSspDeck());
  readonly currentIndex = signal<number>(0);
  readonly isCycleCompleted = signal<boolean>(false);
  readonly hits = signal<number>(0);
  readonly misses = signal<number>(0);
  readonly selectedValue = signal<CardValue | null>(null);
  readonly selectedSuit = signal<SuitCode | null>(null);
  readonly feedback = signal<NextCardTrainerFeedback | null>(null);
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

  protected readonly selectedRankMeta = computed<CardRankMeta | null>(() => {
    const val = this.selectedValue();
    return val !== null ? CARD_RANK_BY_VALUE[val] : null;
  });

  protected readonly selectedSuitOption = computed<SuitChoiceOption | null>(() => {
    const suit = this.selectedSuit();
    if (suit === null) {
      return null;
    }
    return SUIT_CHOICE_OPTIONS.find((opt) => opt.code === suit) ?? null;
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
    this.selectedValue.set(null);
    this.selectedSuit.set(null);
    this.clearTimerInterval();
  }

  selectRank(value: CardValue): void {
    if (!this.isTimerRunning() || this.isCycleCompleted()) {
      return;
    }
    this.selectedValue.set(value);
    this.evaluateIfComplete();
  }

  selectSuit(suit: SuitCode): void {
    if (!this.isTimerRunning() || this.isCycleCompleted()) {
      return;
    }
    this.selectedSuit.set(suit);
    this.evaluateIfComplete();
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
    this.selectedValue.set(null);
    this.selectedSuit.set(null);
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
    this.selectedValue.set(null);
    this.selectedSuit.set(null);
    this.feedback.set(null);
  }

  private evaluateIfComplete(): void {
    const chosenValue = this.selectedValue();
    const chosenSuit = this.selectedSuit();
    if (chosenValue === null || chosenSuit === null) {
      return;
    }

    const promptCard = this.currentCard();
    const expectedCard = getNextSspCard(promptCard);

    this.selectedValue.set(null);
    this.selectedSuit.set(null);

    if (chosenValue === expectedCard.value && chosenSuit === expectedCard.suit) {
      const transition = describeIndexTransition(promptCard.value);
      const suitStepText =
        promptCard.value >= 5 ? '+1 palo' : '+2 palos (salto al mismo color)';

      this.hits.update((count) => count + 1);

      if (this.currentIndex() >= this.deck().length - 1) {
        this.pauseTimer();
        this.isCycleCompleted.set(true);
        this.feedback.set({
          kind: 'hit',
          heading: `¡Ciclo completo superado! Último acierto: ${promptCard.fullName} → ${expectedCard.fullName}.`,
          detail: `Cálculo: ${transition.formulaText} y ${suitStepText}.`,
        });
      } else {
        this.currentIndex.update((idx) => idx + 1);
        this.feedback.set({
          kind: 'hit',
          heading: `¡Acierto! Después del ${promptCard.fullName} sigue el ${expectedCard.fullName}.`,
          detail: `Cálculo: ${transition.formulaText} y ${suitStepText}.`,
        });
      }
      return;
    }

    this.misses.update((count) => count + 1);
    const chosenCard = getSspCardByValueAndSuit(chosenValue, chosenSuit);
    const valueMatches = chosenValue === expectedCard.value;
    const suitMatches = chosenSuit === expectedCard.suit;

    let hint: string;
    if (valueMatches && !suitMatches) {
      hint =
        promptCard.value >= 5
          ? `El índice (${expectedCard.rank}) era correcto, pero falló el palo: como ${promptCard.rank} ≥ 5, avanza +1 palo en PI-CO-TRI-DIA (cambia el color).`
          : `El índice (${expectedCard.rank}) era correcto, pero falló el palo: como ${promptCard.rank} es valor bajo (A–4), aplica salto de +2 palos (mismo color).`;
    } else if (!valueMatches && suitMatches) {
      hint =
        promptCard.value >= 5
          ? `El palo (${SUIT_BY_CODE[expectedCard.suit].pluralName}) era correcto, pero falló el índice: como ${promptCard.rank} ≥ 5, debes restar 4.`
          : `El palo (${SUIT_BY_CODE[expectedCard.suit].pluralName}) era correcto, pero falló el índice: como ${promptCard.rank} es valor bajo (A–4), debes sumar 9.`;
    } else {
      hint =
        promptCard.value >= 5
          ? `Pista: ${promptCard.rank} tiene valor ≥ 5 → resta 4 al índice y avanza +1 palo en PI-CO-TRI-DIA.`
          : `Pista: ${promptCard.rank} es un valor bajo (A, 2, 3 o 4) → suma 9 al índice y salta +2 palos al mismo color.`;
    }

    this.feedback.set({
      kind: 'miss',
      heading: `¡Fallo! El ${chosenCard.fullName} no sigue al ${promptCard.fullName}. Inténtalo de nuevo.`,
      detail: hint,
    });
  }

  private clearTimerInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

