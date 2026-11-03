import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../icon';
import { SuitCode } from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';
import { CourseProgressService } from '../course-progress.service';
import { SuitOrderTrainer } from './suit-order-trainer';
import { SuitPointsDiagram } from './suit-points-diagram';

interface CanonicalSuitStep {
  readonly order: 1 | 2 | 3 | 4;
  readonly code: SuitCode;
  readonly name: string;
  readonly altName?: string;
  readonly deckColor: 'negro' | 'rojo';
  readonly inkHex: string;
  readonly pointsSummary: string;
}

interface MnemonicPart {
  readonly fragment: string;
  readonly suitLabel: string;
  readonly suit: SuitCode;
  readonly inkHex: string;
}

const CANONICAL_SUIT_STEPS: readonly CanonicalSuitStep[] = [
  {
    order: 1,
    code: 'P',
    name: 'Picas',
    deckColor: 'negro',
    inkHex: '#18181b',
    pointsSummary: '1 punta',
  },
  {
    order: 2,
    code: 'C',
    name: 'Corazones',
    deckColor: 'rojo',
    inkHex: '#e11d48',
    pointsSummary: '2 sobresalientes',
  },
  {
    order: 3,
    code: 'T',
    name: 'Tréboles',
    deckColor: 'negro',
    inkHex: '#18181b',
    pointsSummary: '3 sobresalientes',
  },
  {
    order: 4,
    code: 'D',
    name: 'Diamantes',
    altName: 'Rombos',
    deckColor: 'rojo',
    inkHex: '#e11d48',
    pointsSummary: '4 puntas',
  },
] as const;

const PICOTRIDIA_PARTS: readonly MnemonicPart[] = [
  { fragment: 'PI', suitLabel: 'Picas', suit: 'P', inkHex: '#18181b' },
  { fragment: 'CO', suitLabel: 'Corazones', suit: 'C', inkHex: '#e11d48' },
  { fragment: 'TRI', suitLabel: 'Tréboles', suit: 'T', inkHex: '#18181b' },
  { fragment: 'DIA', suitLabel: 'Diamantes', suit: 'D', inkHex: '#e11d48' },
] as const;

const ENGLISH_ACRONYM_PARTS: readonly MnemonicPart[] = [
  { fragment: 'S', suitLabel: 'Spades (Picas)', suit: 'P', inkHex: '#18181b' },
  { fragment: 'H', suitLabel: 'Hearts (Corazones)', suit: 'C', inkHex: '#e11d48' },
  { fragment: 'C', suitLabel: 'Clubs (Tréboles)', suit: 'T', inkHex: '#18181b' },
  { fragment: 'D', suitLabel: 'Diamonds (Rombos)', suit: 'D', inkHex: '#e11d48' },
] as const;

@Component({
  selector: 'app-lesson3',
  imports: [RouterLink, Icon, SuitIcon, SuitPointsDiagram, SuitOrderTrainer],
  templateUrl: './lesson3.html',
  styleUrl: './lesson3.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lesson3 {
  protected readonly progress = inject(CourseProgressService);
  private readonly document = inject(DOCUMENT);

  protected readonly canonicalSteps = CANONICAL_SUIT_STEPS;
  protected readonly picotridiaParts = PICOTRIDIA_PARTS;
  protected readonly englishParts = ENGLISH_ACRONYM_PARTS;

  protected readonly isLessonCompleted = computed<boolean>(() =>
    this.progress.isLessonCompleted('leccion-3'),
  );

  constructor() {
    this.progress.recordLessonVisit('leccion-3');
  }

  protected scrollToSection(sectionId: string): void {
    const target = this.document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    }
  }

  protected completeLesson(): void {
    this.progress.markLessonCompleted('leccion-3');
  }
}
