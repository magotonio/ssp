import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../icon';
import {
  CARD_RANKS,
  CardValue,
  getSspCardByValueAndSuit,
  SspCard,
  SuitCode,
} from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';
import { CourseProgressService } from '../course-progress.service';
import { SUIT_CHOICE_OPTIONS } from '../lesson3/suit-order-trainer';
import { getCardDeckInkHex } from '../lesson4/next-card-trainer';
import { KINGDOMS, KingdomMeta } from '../lesson5/kingdom-trainer';
import {
  AbsolutePositionBreakdown,
  describeAbsolutePosition,
  getKingdomOffset,
  INTERNAL_POSITION_RULES,
  InternalPositionRuleMeta,
  InternalPositionTrainer,
  KingdomOffsetValue,
} from './internal-position-trainer';
import { StudyFlashcards } from './study-flashcards';

interface KingdomOffsetView {
  readonly kingdom: KingdomMeta;
  readonly offset: KingdomOffsetValue;
  readonly offsetLabel: string;
}

interface MnemonicAssociationCard {
  readonly badgeRank: string;
  readonly positionLabel: string;
  readonly title: string;
  readonly description: string;
  readonly inspectValue: CardValue;
}

interface AbsoluteExampleItem {
  readonly card: SspCard;
  readonly summary: string;
}

const MNEMONIC_SEVEN_CARDS: readonly MnemonicAssociationCard[] = [
  {
    badgeRank: '5',
    positionLabel: '2.ª posición',
    title: 'Espejo del 2',
    description:
      'El 5 se parece al número 2 de forma especular o reflejada → ocupa la 2.ª posición.',
    inspectValue: 5,
  },
  {
    badgeRank: '6 y 7',
    positionLabel: '5.ª y 8.ª pos.',
    title: 'Corto y pasado',
    description:
      'El 6 «se queda corto» (5.ª posición en vez de 6.ª) y el 7 «se pasa» (8.ª posición en vez de 7.ª).',
    inspectValue: 6,
  },
  {
    badgeRank: '8',
    positionLabel: '11.ª posición',
    title: '"Muñeco de nieve"',
    description:
      'El 8 está formado por dos círculos superpuestos que recuerdan a un muñeco de nieve (2 bolas). Como el número 11 se compone de dos unos (2 elementos), conectamos un par con el otro par → 11.ª posición.',
    inspectValue: 8,
  },
  {
    badgeRank: '10',
    positionLabel: '4.ª posición',
    title: '«D-I-E-Z» (4 letras)',
    description:
      'La palabra «DIEZ» se escribe exactamente con 4 letras → ocupa la 4.ª posición.',
    inspectValue: 10,
  },
  {
    badgeRank: 'J',
    positionLabel: '7.ª posición',
    title: 'Forma y sonido del 7',
    description:
      'Tanto por sonoridad («Sota») como por su forma gráfica, la J se asocia directamente al 7 → 7.ª posición.',
    inspectValue: 11,
  },
  {
    badgeRank: 'Q',
    positionLabel: '10.ª posición',
    title: 'La «chica 10»',
    description:
      'La Reina (Q) se recuerda como la «chica 10» → ocupa directamente la 10.ª posición.',
    inspectValue: 12,
  },
] as const;

const LESSON6_ABSOLUTE_EXAMPLES: readonly AbsoluteExampleItem[] = [
  {
    card: getSspCardByValueAndSuit(9, 'P'), // 9P -> #1
    summary: '9 = 1.ª pos. + Picas (+0) → #1',
  },
  {
    card: getSspCardByValueAndSuit(10, 'C'), // 10C -> #17
    summary: '«DIEZ» = 4.ª pos. + Corazones (+13) → #17',
  },
  {
    card: getSspCardByValueAndSuit(7, 'D'), // 7D -> #34
    summary: '7 se pasa = 8.ª pos. + Tréboles (+26) → #34',
  },
  {
    card: getSspCardByValueAndSuit(1, 'C'), // AC -> #42
    summary: 'As (1×3) = 3.ª pos. + Diamantes (+39) → #42',
  },
] as const;

@Component({
  selector: 'app-lesson6',
  imports: [RouterLink, Icon, SuitIcon, InternalPositionTrainer, StudyFlashcards],
  templateUrl: './lesson6.html',
  styleUrl: './lesson6.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lesson6 {
  protected readonly progress = inject(CourseProgressService);
  private readonly document = inject(DOCUMENT);

  protected readonly ranks = CARD_RANKS;
  protected readonly suitOptions = SUIT_CHOICE_OPTIONS;

  protected readonly directMathRules: readonly InternalPositionRuleMeta[] =
    INTERNAL_POSITION_RULES.filter((r) => r.mathAdjustment === 'direct');
  protected readonly minus13MathRules: readonly InternalPositionRuleMeta[] =
    INTERNAL_POSITION_RULES.filter((r) => r.mathAdjustment === 'minus13');
  protected readonly minus26MathRules: readonly InternalPositionRuleMeta[] =
    INTERNAL_POSITION_RULES.filter((r) => r.mathAdjustment === 'minus26');

  protected readonly mnemonicAssociations = MNEMONIC_SEVEN_CARDS;
  protected readonly absoluteExamples = LESSON6_ABSOLUTE_EXAMPLES;

  protected readonly kingdomOffsets: readonly KingdomOffsetView[] = KINGDOMS.map((kingdom) => {
    const offset = getKingdomOffset(kingdom.suit);
    return {
      kingdom,
      offset,
      offsetLabel: `+${offset}`,
    };
  });

  protected readonly inspectedValue = signal<CardValue>(10);
  protected readonly inspectedSuit = signal<SuitCode>('C');

  protected readonly isLessonCompleted = computed<boolean>(() =>
    this.progress.isLessonCompleted('leccion-6'),
  );

  protected readonly inspectedCard = computed<SspCard>(() =>
    getSspCardByValueAndSuit(this.inspectedValue(), this.inspectedSuit()),
  );

  protected readonly inspectedBreakdown = computed<AbsolutePositionBreakdown>(() =>
    describeAbsolutePosition(this.inspectedCard()),
  );

  constructor() {
    this.progress.recordLessonVisit('leccion-6');
  }

  protected cardInkHex(suit: SuitCode): string {
    return getCardDeckInkHex(suit);
  }

  protected selectInspectorValue(value: CardValue): void {
    this.inspectedValue.set(value);
  }

  protected selectInspectorSuit(suit: SuitCode): void {
    this.inspectedSuit.set(suit);
  }

  protected inspectCard(card: SspCard): void {
    this.inspectedValue.set(card.value);
    this.inspectedSuit.set(card.suit);
  }

  protected scrollToSection(sectionId: string): void {
    const target = this.document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    }
  }

  protected completeLesson(): void {
    this.progress.markLessonCompleted('leccion-6');
  }
}

