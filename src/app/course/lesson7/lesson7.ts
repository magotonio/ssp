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
  AbsolutePositionBreakdown,
  describeAbsolutePosition,
  InternalPositionNumber,
} from '../lesson6/internal-position-trainer';
import { PHYSICAL_TOLERANCE_CARDS, RiffleCutTrainer } from './riffle-cut-trainer';

export type KingdomZoneId = 'start' | 'middle' | 'end';

export interface KingdomZoneMeta {
  readonly id: KingdomZoneId;
  readonly label: string;
  readonly rangeText: string;
  readonly indicesText: string;
  readonly tactileTip: string;
  readonly badgeBg: string;
  readonly badgeText: string;
}

export interface LandmarkKingView {
  readonly position: 13 | 26 | 39 | 52;
  readonly fractionLabel: string;
  readonly card: SspCard;
  readonly note: string;
}

export interface TactileExampleItem {
  readonly card: SspCard;
  readonly summary: string;
}

export const KINGDOM_ZONES: readonly KingdomZoneMeta[] = [
  {
    id: 'start',
    label: 'Principio del reino',
    rangeText: 'Posiciones 1.ª a 4.ª',
    indicesText: 'Índices 9 (1.ª), 5 (2.ª), A (3.ª) y 10 (4.ª)',
    tactileTip: 'Corta al Rey del bloque anterior y riflea apenas 1 a 4 cartas hacia abajo.',
    badgeBg: '#edf2eb',
    badgeText: '#397153',
  },
  {
    id: 'middle',
    label: 'Centro del reino',
    rangeText: 'Posiciones 5.ª a 9.ª',
    indicesText: 'Índices 6 (5.ª), 2 (6.ª), J (7.ª), 7 (8.ª) y 3 (9.ª)',
    tactileTip: 'Apunta a la mitad del cuarto de 13 cartas y ajusta con un rifleado corto.',
    badgeBg: '#fdf0e5',
    badgeText: '#9c4c1f',
  },
  {
    id: 'end',
    label: 'Final del reino',
    rangeText: 'Posiciones 10.ª a 13.ª',
    indicesText: 'Índices Q (10.ª), 8 (11.ª), 4 (12.ª) y K (13.ª)',
    tactileTip: 'Apunta casi al Rey que cierra ese bloque y retrocede de 0 a 3 cartas.',
    badgeBg: '#f0eef9',
    badgeText: '#5b4b8a',
  },
] as const;

const ZONE_BY_ID: Readonly<Record<KingdomZoneId, KingdomZoneMeta>> = {
  start: KINGDOM_ZONES[0],
  middle: KINGDOM_ZONES[1],
  end: KINGDOM_ZONES[2],
};

export function getRelativeKingdomZone(internalPos: InternalPositionNumber): KingdomZoneMeta {
  if (internalPos <= 4) {
    return ZONE_BY_ID.start;
  }
  if (internalPos <= 9) {
    return ZONE_BY_ID.middle;
  }
  return ZONE_BY_ID.end;
}

const LANDMARK_KINGS: readonly LandmarkKingView[] = [
  {
    position: 13,
    fractionLabel: '1.er bloque · 1/4',
    card: SSP_STACK[12], // KP
    note: 'Cierra el Reino de Picas (primer paquete de 13 cartas).',
  },
  {
    position: 26,
    fractionLabel: 'Mitad exacta · 1/2',
    card: SSP_STACK[25], // KC
    note: `Referencia central de corte al tacto (tolerancia aceptable ±${PHYSICAL_TOLERANCE_CARDS} cartas).`,
  },
  {
    position: 39,
    fractionLabel: '3.er bloque · 3/4',
    card: SSP_STACK[38], // KT
    note: 'Cierra el Reino de Tréboles dejando solo 13 cartas en el fondo.',
  },
  {
    position: 52,
    fractionLabel: 'Fondo · 4/4',
    card: SSP_STACK[51], // KD
    note: 'Última carta de la baraja estándar (cierra el Reino de Diamantes).',
  },
] as const;

const LESSON7_TACTILE_EXAMPLES: readonly TactileExampleItem[] = [
  {
    card: getSspCardByValueAndSuit(7, 'D'), // 7D -> 8.ª de Tréboles = #34
    summary: '8.ª pos. de Tréboles (+26) → #34 (centro del 3.er bloque)',
  },
  {
    card: getSspCardByValueAndSuit(13, 'C'), // KC -> 13.ª de Corazones = #26
    summary: '13.ª pos. de Corazones (+13) → #26 (mitad exacta del mazo)',
  },
  {
    card: getSspCardByValueAndSuit(1, 'T'), // AT -> 3.ª de Picas = #3
    summary: '3.ª pos. de Picas (+0) → #3 (principio del 1.er bloque)',
  },
  {
    card: getSspCardByValueAndSuit(8, 'P'), // 8P -> 11.ª de Diamantes = #50
    summary: '11.ª pos. de Diamantes (+39) → #50 (final del 4.º bloque)',
  },
] as const;

@Component({
  selector: 'app-lesson7',
  imports: [RouterLink, Icon, SuitIcon, RiffleCutTrainer],
  templateUrl: './lesson7.html',
  styleUrl: './lesson7.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lesson7 {
  protected readonly progress = inject(CourseProgressService);
  private readonly document = inject(DOCUMENT);

  protected readonly ranks = CARD_RANKS;
  protected readonly suitOptions = SUIT_CHOICE_OPTIONS;
  protected readonly landmarkKings = LANDMARK_KINGS;
  protected readonly kingdomZones = KINGDOM_ZONES;
  protected readonly tactileExamples = LESSON7_TACTILE_EXAMPLES;
  protected readonly toleranceLimit = PHYSICAL_TOLERANCE_CARDS;

  protected readonly inspectedValue = signal<CardValue>(7);
  protected readonly inspectedSuit = signal<SuitCode>('D');

  protected readonly isLessonCompleted = computed<boolean>(() =>
    this.progress.isLessonCompleted('leccion-7'),
  );

  protected readonly inspectedCard = computed<SspCard>(() =>
    getSspCardByValueAndSuit(this.inspectedValue(), this.inspectedSuit()),
  );

  protected readonly inspectedBreakdown = computed<AbsolutePositionBreakdown>(() =>
    describeAbsolutePosition(this.inspectedCard()),
  );

  protected readonly inspectedZone = computed<KingdomZoneMeta>(() =>
    getRelativeKingdomZone(this.inspectedBreakdown().internalPosition),
  );

  constructor() {
    this.progress.recordLessonVisit('leccion-7');
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
    this.progress.markLessonCompleted('leccion-7');
  }
}

