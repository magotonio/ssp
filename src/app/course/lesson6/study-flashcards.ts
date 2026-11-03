import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Icon } from '../../icon';
import { CardValue } from '../../ssp/ssp-stack';
import {
  INTERNAL_CYCLE_SIZE,
  INTERNAL_POSITION_RULES,
  INTERNAL_RULE_BY_VALUE,
  InternalPositionRuleMeta,
  shuffleCardValues,
} from './internal-position-trainer';

export type FlashcardFrontFace = 'rank' | 'position';

const ORDERED_VALUES: readonly CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

@Component({
  selector: 'app-study-flashcards',
  imports: [Icon],
  templateUrl: './study-flashcards.html',
  styleUrl: './study-flashcards.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudyFlashcards {
  protected readonly totalCards = INTERNAL_CYCLE_SIZE;

  readonly cardOrder = signal<readonly CardValue[]>(ORDERED_VALUES);
  readonly currentIndex = signal<number>(0);
  readonly isFlipped = signal<boolean>(false);
  readonly frontFace = signal<FlashcardFrontFace>('rank');
  readonly isShuffled = signal<boolean>(false);

  protected readonly orderedRules = computed<readonly InternalPositionRuleMeta[]>(() =>
    this.cardOrder().map((value) => INTERNAL_RULE_BY_VALUE[value]),
  );

  protected readonly currentRule = computed<InternalPositionRuleMeta>(
    () => this.orderedRules()[this.currentIndex()] ?? INTERNAL_POSITION_RULES[0],
  );

  protected readonly stepLabel = computed<string>(
    () => `${this.currentIndex() + 1} / ${INTERNAL_CYCLE_SIZE}`,
  );

  protected readonly showsRankSide = computed<boolean>(() => {
    const frontIsRank = this.frontFace() === 'rank';
    return this.isFlipped() ? !frontIsRank : frontIsRank;
  });

  flipCard(): void {
    this.isFlipped.update((flipped) => !flipped);
  }

  previousCard(): void {
    this.isFlipped.set(false);
    this.currentIndex.update((idx) => (idx - 1 + INTERNAL_CYCLE_SIZE) % INTERNAL_CYCLE_SIZE);
  }

  nextCard(): void {
    this.isFlipped.set(false);
    this.currentIndex.update((idx) => (idx + 1) % INTERNAL_CYCLE_SIZE);
  }

  selectCardAt(index: number): void {
    if (index < 0 || index >= INTERNAL_CYCLE_SIZE) {
      return;
    }
    this.currentIndex.set(index);
    this.isFlipped.set(false);
  }

  shuffleDeck(): void {
    this.cardOrder.set(shuffleCardValues());
    this.currentIndex.set(0);
    this.isFlipped.set(false);
    this.isShuffled.set(true);
  }

  restoreCanonicalOrder(): void {
    this.cardOrder.set(ORDERED_VALUES);
    this.currentIndex.set(0);
    this.isFlipped.set(false);
    this.isShuffled.set(false);
  }

  setFrontFace(face: FlashcardFrontFace): void {
    if (this.frontFace() === face) {
      return;
    }
    this.frontFace.set(face);
    this.isFlipped.set(false);
  }
}

