import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../icon';
import {
  CARD_RANKS,
  CardValue,
  getSspCardByValueAndSuit,
  SSP_STACK,
  SspCard,
  SuitCode,
} from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';
import { CourseProgressService } from '../course-progress.service';
import { SUIT_CHOICE_OPTIONS } from '../lesson3/suit-order-trainer';
import { getCardDeckInkHex } from '../lesson4/next-card-trainer';
import {
  describeKingdomClassification,
  getCardCharacter,
  KINGDOM_BY_SUIT,
  KINGDOMS,
  KingdomCharacterMeta,
  KingdomMeta,
  KingdomTrainer,
} from './kingdom-trainer';

interface KingdomExampleItem {
  readonly card: SspCard;
  readonly summary: string;
}

interface KingdomBlockCardView {
  readonly card: SspCard;
  readonly character: KingdomCharacterMeta;
  readonly inkHex: string;
}

const LESSON5_EXAMPLES: readonly KingdomExampleItem[] = [
  {
    card: getSspCardByValueAndSuit(10, 'C'), // 10C
    summary: 'Noble: dice la verdad → Reino de Corazones (2.º)',
  },
  {
    card: getSspCardByValueAndSuit(13, 'T'), // KT
    summary: 'Noble: dice la verdad → Reino de Tréboles (3.º)',
  },
  {
    card: getSspCardByValueAndSuit(3, 'C'), // 3C
    summary: 'Político: mismo color rojo → Reino de Diamantes (4.º)',
  },
  {
    card: getSspCardByValueAndSuit(2, 'T'), // 2T
    summary: 'Político: mismo color negro → Reino de Picas (1.º)',
  },
  {
    card: getSspCardByValueAndSuit(8, 'C'), // 8C
    summary: 'Científico: antecede a Corazones → Reino de Picas (1.º)',
  },
  {
    card: getSspCardByValueAndSuit(5, 'T'), // 5T
    summary: 'Científico: antecede a Tréboles → Reino de Corazones (2.º)',
  },
  {
    card: getSspCardByValueAndSuit(7, 'D'), // 7D
    summary: 'Científico: antecede a Diamantes → Reino de Tréboles (3.º)',
  },
  {
    card: getSspCardByValueAndSuit(6, 'P'), // 6P
    summary: 'Científico: antecede a Picas → Reino de Diamantes (4.º)',
  },
] as const;

@Component({
  selector: 'app-lesson5',
  imports: [RouterLink, Icon, SuitIcon, KingdomTrainer],
  templateUrl: './lesson5.html',
  styleUrl: './lesson5.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lesson5 {
  protected readonly progress = inject(CourseProgressService);
  private readonly document = inject(DOCUMENT);

  protected readonly kingdoms = KINGDOMS;
  protected readonly examples = LESSON5_EXAMPLES;
  protected readonly ranks = CARD_RANKS;
  protected readonly suitOptions = SUIT_CHOICE_OPTIONS;

  protected readonly selectedBlockSuit = signal<SuitCode>('P');
  protected readonly inspectedValue = signal<CardValue>(10);
  protected readonly inspectedSuit = signal<SuitCode>('C');

  protected readonly isLessonCompleted = computed<boolean>(() =>
    this.progress.isLessonCompleted('leccion-5'),
  );

  protected readonly selectedKingdomBlock = computed<KingdomMeta>(
    () => KINGDOM_BY_SUIT[this.selectedBlockSuit()],
  );

  protected readonly selectedBlockCards = computed<readonly KingdomBlockCardView[]>(() => {
    const block = this.selectedKingdomBlock();
    return SSP_STACK.slice(block.startPosition - 1, block.endPosition).map((card) => ({
      card,
      character: getCardCharacter(card.value),
      inkHex: getCardDeckInkHex(card.suit),
    }));
  });

  protected readonly inspectedCard = computed<SspCard>(() =>
    getSspCardByValueAndSuit(this.inspectedValue(), this.inspectedSuit()),
  );

  protected readonly inspectedDetail = computed(() =>
    describeKingdomClassification(this.inspectedCard()),
  );

  constructor() {
    this.progress.recordLessonVisit('leccion-5');
  }

  protected cardInkHex(suit: SuitCode): string {
    return getCardDeckInkHex(suit);
  }

  protected selectKingdomBlock(suit: SuitCode): void {
    this.selectedBlockSuit.set(suit);
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
    this.progress.markLessonCompleted('leccion-5');
  }
}

