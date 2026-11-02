import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Icon } from '../../icon';
import {
  CARD_RANK_BY_VALUE,
  CARD_RANKS,
  CardRankMeta,
  CardValue,
  getNextCardValue,
} from '../../ssp/ssp-stack';

export interface TrainerFeedback {
  readonly kind: 'hit' | 'miss';
  readonly heading: string;
  readonly detail: string;
}

export function formatValueWithRank(meta: CardRankMeta): string {
  if (meta.value === 1 || meta.value >= 11) {
    return `${meta.rank} (${meta.value})`;
  }
  return meta.rank;
}

export function describeIndexTransition(fromValue: CardValue): {
  readonly operatorLabel: '− 4' | '+ 9';
  readonly formulaText: string;
  readonly ruleReason: string;
} {
  const fromMeta = CARD_RANK_BY_VALUE[fromValue];
  const toValue = getNextCardValue(fromValue);
  const toMeta = CARD_RANK_BY_VALUE[toValue];

  if (fromValue >= 5) {
    const resultText = toMeta.value === 1 ? `1 (${toMeta.rank})` : toMeta.rank;
    return {
      operatorLabel: '− 4',
      formulaText: `${formatValueWithRank(fromMeta)} − 4 = ${resultText}`,
      ruleReason: `Como ${fromMeta.rank} tiene valor ≥ 5, se resta 4 directamente.`,
    };
  }

  const resultText = toMeta.value >= 11 ? `${toMeta.value} (${toMeta.rank})` : toMeta.rank;
  return {
    operatorLabel: '+ 9',
    formulaText: `${formatValueWithRank(fromMeta)} + 9 = ${resultText}`,
    ruleReason: `Como ${fromMeta.rank} es un valor bajo (≤ 4), restar 4 no sería positivo y se suma 9.`,
  };
}

function pickRandomCardValue(exclude?: CardValue): CardValue {
  const candidates =
    exclude === undefined
      ? CARD_RANKS
      : CARD_RANKS.filter((item) => item.value !== exclude);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex].value;
}

@Component({
  selector: 'app-next-index-trainer',
  imports: [Icon],
  templateUrl: './next-index-trainer.html',
  styleUrl: './next-index-trainer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextIndexTrainer {
  protected readonly ranks = CARD_RANKS;

  readonly currentValue = signal<CardValue>(pickRandomCardValue());
  readonly hits = signal<number>(0);
  readonly misses = signal<number>(0);
  readonly failedValues = signal<readonly CardValue[]>([]);
  readonly feedback = signal<TrainerFeedback | null>(null);

  protected readonly currentRank = computed<CardRankMeta>(
    () => CARD_RANK_BY_VALUE[this.currentValue()],
  );

  protected readonly currentCardSubtitle = computed<string>(() => {
    const meta = this.currentRank();
    if (meta.value >= 2 && meta.value <= 10) {
      return `Índice numérico ${meta.rank}`;
    }
    return meta.valueName;
  });

  protected readonly totalAttempts = computed<number>(() => this.hits() + this.misses());

  protected readonly accuracyPercent = computed<number | null>(() => {
    const total = this.totalAttempts();
    if (total === 0) {
      return null;
    }
    return Math.round((this.hits() / total) * 100);
  });

  selectAnswer(selectedValue: CardValue): void {
    const promptValue = this.currentValue();
    const expectedValue = getNextCardValue(promptValue);
    const promptMeta = CARD_RANK_BY_VALUE[promptValue];
    const selectedMeta = CARD_RANK_BY_VALUE[selectedValue];

    if (selectedValue === expectedValue) {
      const expectedMeta = CARD_RANK_BY_VALUE[expectedValue];
      const transition = describeIndexTransition(promptValue);

      this.hits.update((count) => count + 1);
      this.failedValues.set([]);
      this.feedback.set({
        kind: 'hit',
        heading: `¡Acierto! Después de ${promptMeta.rank} sigue ${expectedMeta.rank}.`,
        detail: `Cálculo: ${transition.formulaText}.`,
      });
      this.currentValue.set(pickRandomCardValue(promptValue));
      return;
    }

    this.misses.update((count) => count + 1);
    this.failedValues.update((prev) =>
      prev.includes(selectedValue) ? prev : [...prev, selectedValue],
    );

    const hint =
      promptValue >= 5
        ? `Pista: ${promptMeta.rank} es ≥ 5, así que debes restar 4.`
        : `Pista: ${promptMeta.rank} es un índice bajo (A, 2, 3 o 4), así que debes sumar 9.`;

    this.feedback.set({
      kind: 'miss',
      heading: `¡Fallo! ${selectedMeta.rank} no sigue a ${promptMeta.rank}. Prueba otra vez.`,
      detail: hint,
    });
  }

  resetCounters(): void {
    this.hits.set(0);
    this.misses.set(0);
    this.failedValues.set([]);
    this.feedback.set(null);
  }

  setPromptForTesting(value: CardValue): void {
    this.currentValue.set(value);
    this.failedValues.set([]);
    this.feedback.set(null);
  }

  protected isFailedOption(value: CardValue): boolean {
    return this.failedValues().includes(value);
  }
}

