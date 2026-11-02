import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../icon';
import {
  CardValue,
  SspCard,
  SUIT_BY_CODE,
  SUITS,
  SuitCode,
  SuitMeta,
} from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';
import { CourseProgressService } from '../course-progress.service';
import {
  ASSEMBLY_PILES_BY_SEPARATION,
  getFollowingSspCards,
  getSspCardBySuitAndValue,
  PREPARATION_PACKETS_TOP_TO_BOTTOM,
  TABLE_PILES_LEFT_TO_RIGHT,
} from './lesson1-assembly';
import { PickupTrainer } from './pickup-trainer';

type StepNumber = 1 | 2 | 3 | 4;

interface GuidedStepSummary {
  readonly number: StepNumber;
  readonly sectionId: string;
  readonly shortLabel: string;
  readonly checkpointText: string;
}

interface RankOption {
  readonly value: CardValue;
  readonly rank: string;
  readonly label: string;
}

const RANK_OPTIONS: readonly RankOption[] = [
  { value: 1, rank: 'A', label: 'As' },
  { value: 2, rank: '2', label: '2' },
  { value: 3, rank: '3', label: '3' },
  { value: 4, rank: '4', label: '4' },
  { value: 5, rank: '5', label: '5' },
  { value: 6, rank: '6', label: '6' },
  { value: 7, rank: '7', label: '7' },
  { value: 8, rank: '8', label: '8' },
  { value: 9, rank: '9', label: '9' },
  { value: 10, rank: '10', label: '10' },
  { value: 11, rank: 'J', label: 'Jota' },
  { value: 12, rank: 'Q', label: 'Reina' },
  { value: 13, rank: 'K', label: 'Rey' },
] as const;

const VALUE_SEQUENCE_PREVIEW: readonly string[] = [
  '9',
  '5',
  '1 (As)',
  '10',
  '6',
  '2',
  'J (11)',
  '7',
  '3',
  'Q (12)',
  '8',
  '4',
  'Rey (13)',
] as const;

@Component({
  selector: 'app-lesson1',
  imports: [RouterLink, Icon, SuitIcon, PickupTrainer],
  templateUrl: './lesson1.html',
  styleUrl: './lesson1.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lesson1 {
  protected readonly progress = inject(CourseProgressService);
  private readonly document = inject(DOCUMENT);

  protected readonly suits = SUITS;
  protected readonly suitByCode = SUIT_BY_CODE;
  protected readonly rankOptions = RANK_OPTIONS;
  protected readonly preparationPackets = PREPARATION_PACKETS_TOP_TO_BOTTOM;
  protected readonly separationPiles = ASSEMBLY_PILES_BY_SEPARATION;
  protected readonly tablePilesLeftToRight = TABLE_PILES_LEFT_TO_RIGHT;
  protected readonly valueSequencePreview = VALUE_SEQUENCE_PREVIEW;

  protected readonly guidedSteps: readonly GuidedStepSummary[] = [
    {
      number: 1,
      sectionId: 'paso-1',
      shortLabel: '1. Preparar palos',
      checkpointText:
        'Tengo los 4 palos apilados cara arriba (de Rey abajo a As arriba) con el As de Diamantes visible arriba y el Rey de Picas en el fondo.',
    },
    {
      number: 2,
      sectionId: 'paso-2',
      shortLabel: '2. Tres montones',
      checkpointText:
        'Tengo los 3 montones cara arriba en la mesa viendo arriba el 9 de Corazones (izquierda), el 5 de Tréboles (centro) y el As de Diamantes / rombos (derecha).',
    },
    {
      number: 3,
      sectionId: 'paso-3',
      shortLabel: '3. Recoger «1, 2, 3»',
      checkpointText:
        'He recogido las 52 cartas cara arriba encima siguiendo «uno, dos, tres…» (terminando en el Rey de Picas) y he volteado el mazo dorso arriba.',
    },
    {
      number: 4,
      sectionId: 'paso-4',
      shortLabel: '4. Comprobar mazo',
      checkpointText:
        'He verificado las cartas siguientes en mi baraja física y comprobado que los cortes mantienen intacta la secuencia.',
    },
  ];

  protected readonly completedSteps = signal<Readonly<Record<StepNumber, boolean>>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  protected readonly checkerSuit = signal<SuitCode>('D');
  protected readonly checkerValue = signal<CardValue>(13);

  protected readonly isLessonCompleted = computed<boolean>(() =>
    this.progress.isLessonCompleted('leccion-1'),
  );

  protected readonly completedStepCount = computed<number>(() => {
    const state = this.completedSteps();
    return ([1, 2, 3, 4] as const).filter((step) => state[step]).length;
  });

  protected readonly selectedCheckerCard = computed<SspCard>(() =>
    getSspCardBySuitAndValue(this.checkerSuit(), this.checkerValue()),
  );

  protected readonly selectedCheckerSuitMeta = computed<SuitMeta>(
    () => SUIT_BY_CODE[this.checkerSuit()],
  );

  protected readonly followingCards = computed<readonly SspCard[]>(() =>
    getFollowingSspCards(this.selectedCheckerCard(), 6),
  );

  constructor() {
    this.progress.recordLessonVisit('leccion-1');
  }

  protected isStepDone(step: StepNumber): boolean {
    return this.completedSteps()[step];
  }

  protected toggleStepDone(step: StepNumber): void {
    this.completedSteps.update((prev) => ({
      ...prev,
      [step]: !prev[step],
    }));
  }

  protected markStepAndGoNext(step: StepNumber, nextSectionId: string): void {
    this.completedSteps.update((prev) => ({
      ...prev,
      [step]: true,
    }));
    this.scrollToSection(nextSectionId);
  }

  protected onTrainerCompleted(): void {
    this.completedSteps.update((prev) => ({
      ...prev,
      3: true,
    }));
  }

  protected scrollToSection(sectionId: string): void {
    const target = this.document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    }
  }

  protected selectCheckerSuit(suit: SuitCode): void {
    this.checkerSuit.set(suit);
  }

  protected selectCheckerValue(value: CardValue): void {
    this.checkerValue.set(value);
  }

  protected setCheckerPreset(preset: 'freshFlip' | 'canonicalStart'): void {
    if (preset === 'freshFlip') {
      // Recién volteada tras recoger: KP quedó en la cara inferior -> arriba empieza en 9C, 5T, AD...
      this.checkerSuit.set('P');
      this.checkerValue.set(13);
    } else {
      // Posición canónica inicial: KD en la cara inferior -> arriba empieza en 9P, 5C, AT...
      this.checkerSuit.set('D');
      this.checkerValue.set(13);
    }
  }

  protected completeLesson(): void {
    this.completedSteps.set({ 1: true, 2: true, 3: true, 4: true });
    this.progress.markLessonCompleted('leccion-1');
  }
}

