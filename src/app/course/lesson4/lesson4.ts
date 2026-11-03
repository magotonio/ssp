import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../icon';
import {
  CARD_RANKS,
  CardValue,
  getNextSspCard,
  getSspCardByValueAndSuit,
  SSP_STACK,
  SspCard,
  SUIT_BY_CODE,
  SuitCode,
} from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';
import { CourseProgressService } from '../course-progress.service';
import { describeIndexTransition } from '../lesson2/next-index-trainer';
import { SUIT_CHOICE_OPTIONS } from '../lesson3/suit-order-trainer';
import { getCardDeckInkHex, NextCardTrainer } from './next-card-trainer';

interface SequenceExampleStep {
  readonly from: SspCard;
  readonly to: SspCard;
  readonly isSuitJump: boolean;
  readonly summary: string;
}

const OPENING_SEQUENCE_STEPS: readonly SequenceExampleStep[] = [
  {
    from: SSP_STACK[0], // 9P
    to: SSP_STACK[1], // 5C
    isSuitJump: false,
    summary: 'Resta 4 (9 → 5) y avanza +1 palo a Corazones',
  },
  {
    from: SSP_STACK[1], // 5C
    to: SSP_STACK[2], // AT
    isSuitJump: false,
    summary: 'Resta 4 (5 → As) y avanza +1 palo a Tréboles',
  },
  {
    from: SSP_STACK[2], // AT
    to: SSP_STACK[3], // 10P
    isSuitJump: true,
    summary: 'Suma 9 (As → 10) y salto de palo (+2) al otro negro: Picas',
  },
  {
    from: SSP_STACK[3], // 10P
    to: SSP_STACK[4], // 6C
    isSuitJump: false,
    summary: 'Resta 4 (10 → 6) y avanza +1 palo a Corazones',
  },
] as const;

@Component({
  selector: 'app-lesson4',
  imports: [RouterLink, Icon, SuitIcon, NextCardTrainer],
  templateUrl: './lesson4.html',
  styleUrl: './lesson4.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lesson4 {
  protected readonly progress = inject(CourseProgressService);
  private readonly document = inject(DOCUMENT);

  protected readonly openingSteps = OPENING_SEQUENCE_STEPS;
  protected readonly ranks = CARD_RANKS;
  protected readonly suitOptions = SUIT_CHOICE_OPTIONS;

  protected readonly inspectedValue = signal<CardValue>(9);
  protected readonly inspectedSuit = signal<SuitCode>('P');

  protected readonly isLessonCompleted = computed<boolean>(() =>
    this.progress.isLessonCompleted('leccion-4'),
  );

  protected readonly inspectedFromCard = computed<SspCard>(() =>
    getSspCardByValueAndSuit(this.inspectedValue(), this.inspectedSuit()),
  );

  protected readonly inspectedToCard = computed<SspCard>(() =>
    getNextSspCard(this.inspectedFromCard()),
  );

  protected readonly inspectedIsLowValue = computed<boolean>(
    () => this.inspectedFromCard().value <= 4,
  );

  protected readonly inspectedIndexDetail = computed(() =>
    describeIndexTransition(this.inspectedFromCard().value),
  );

  protected readonly inspectedSuitDetail = computed<string>(() => {
    const fromCard = this.inspectedFromCard();
    const toCard = this.inspectedToCard();
    const fromSuitName = SUIT_BY_CODE[fromCard.suit].pluralName;
    const toSuitName = SUIT_BY_CODE[toCard.suit].pluralName;

    if (fromCard.value <= 4) {
      const colorWord = fromCard.suit === 'P' || fromCard.suit === 'T' ? 'negro' : 'rojo';
      return `Salto de +2 palos (${fromSuitName} → ${toSuitName}, se mantiene el color ${colorWord})`;
    }
    return `Avanza +1 palo en la rueda (${fromSuitName} → ${toSuitName}, cambia el color)`;
  });

  constructor() {
    this.progress.recordLessonVisit('leccion-4');
  }

  protected cardInkHex(suit: SuitCode): string {
    return getCardDeckInkHex(suit);
  }

  protected inspectCard(card: SspCard): void {
    this.inspectedValue.set(card.value);
    this.inspectedSuit.set(card.suit);
  }

  protected selectInspectorValue(value: CardValue): void {
    this.inspectedValue.set(value);
  }

  protected selectInspectorSuit(suit: SuitCode): void {
    this.inspectedSuit.set(suit);
  }

  protected scrollToSection(sectionId: string): void {
    const target = this.document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    }
  }

  protected completeLesson(): void {
    this.progress.markLessonCompleted('leccion-4');
  }
}

