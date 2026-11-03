import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../icon';
import {
  CARD_RANK_BY_VALUE,
  CARD_RANKS,
  CardRankMeta,
  CardValue,
  getNextCardValue,
  SSP_VALUE_CYCLE,
} from '../../ssp/ssp-stack';
import { CourseProgressService } from '../course-progress.service';
import { describeIndexTransition, NextIndexTrainer } from './next-index-trainer';

interface FigureEquivalence {
  readonly rank: string;
  readonly name: string;
  readonly numericText: string;
  readonly note: string;
}

interface RuleExample {
  readonly fromRank: string;
  readonly operation: string;
  readonly toRank: string;
}

interface CycleStepView {
  readonly order: number;
  readonly meta: CardRankMeta;
  readonly isLowValue: boolean;
}

const FIGURE_EQUIVALENCES: readonly FigureEquivalence[] = [
  { rank: 'A', name: 'As', numericText: '1', note: 'Primer valor numérico' },
  { rank: '2 – 10', name: 'Números', numericText: '2 al 10', note: 'Su valor nominal directo' },
  { rank: 'J', name: 'Jota (Sota)', numericText: '11', note: 'Primera figura' },
  { rank: 'Q', name: 'Reina', numericText: '12', note: 'Segunda figura' },
  { rank: 'K', name: 'Rey', numericText: '13 (o 0)', note: 'Cierra y reinicia el ciclo' },
] as const;

const SUBTRACT_FOUR_EXAMPLES: readonly RuleExample[] = [
  { fromRank: '9', operation: '9 − 4', toRank: '5' },
  { fromRank: '5', operation: '5 − 4', toRank: 'A (1)' },
  { fromRank: '10', operation: '10 − 4', toRank: '6' },
  { fromRank: 'J (11)', operation: '11 − 4', toRank: '7' },
  { fromRank: 'Q (12)', operation: '12 − 4', toRank: '8' },
  { fromRank: 'K (13)', operation: '13 − 4', toRank: '9' },
] as const;

const ADD_NINE_EXAMPLES: readonly RuleExample[] = [
  { fromRank: 'A (1)', operation: '1 + 9', toRank: '10' },
  { fromRank: '2', operation: '2 + 9', toRank: 'J (11)' },
  { fromRank: '3', operation: '3 + 9', toRank: 'Q (12)' },
  { fromRank: '4', operation: '4 + 9', toRank: 'K (13)' },
] as const;

@Component({
  selector: 'app-lesson2',
  imports: [RouterLink, Icon, NextIndexTrainer],
  templateUrl: './lesson2.html',
  styleUrl: './lesson2.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lesson2 {
  protected readonly progress = inject(CourseProgressService);
  private readonly document = inject(DOCUMENT);

  protected readonly figureEquivalences = FIGURE_EQUIVALENCES;
  protected readonly subtractFourExamples = SUBTRACT_FOUR_EXAMPLES;
  protected readonly addNineExamples = ADD_NINE_EXAMPLES;
  protected readonly allRanks = CARD_RANKS;

  protected readonly cycleSteps: readonly CycleStepView[] = SSP_VALUE_CYCLE.map(
    (value, index) => ({
      order: index + 1,
      meta: CARD_RANK_BY_VALUE[value],
      isLowValue: value <= 4,
    }),
  );

  protected readonly inspectedValue = signal<CardValue>(9);

  protected readonly isLessonCompleted = computed<boolean>(() =>
    this.progress.isLessonCompleted('leccion-2'),
  );

  protected readonly inspectedFromMeta = computed<CardRankMeta>(
    () => CARD_RANK_BY_VALUE[this.inspectedValue()],
  );

  protected readonly inspectedToMeta = computed<CardRankMeta>(() => {
    const nextValue = getNextCardValue(this.inspectedValue());
    return CARD_RANK_BY_VALUE[nextValue];
  });

  protected readonly inspectedTransition = computed(() =>
    describeIndexTransition(this.inspectedValue()),
  );

  constructor() {
    this.progress.recordLessonVisit('leccion-2');
  }

  protected inspectValue(value: CardValue): void {
    this.inspectedValue.set(value);
  }

  protected scrollToSection(sectionId: string): void {
    const target = this.document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    }
  }

  protected completeLesson(): void {
    this.progress.markLessonCompleted('leccion-2');
  }
}

