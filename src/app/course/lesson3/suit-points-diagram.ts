import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { getNextSuit, SUIT_BY_CODE, SuitCode } from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';

export interface SuitPointMarker {
  readonly number: 1 | 2 | 3 | 4;
  readonly label: string;
  readonly tipX: number;
  readonly tipY: number;
  readonly badgeX: number;
  readonly badgeY: number;
  readonly lineX1: number;
  readonly lineY1: number;
  readonly lineX2: number;
  readonly lineY2: number;
  readonly highlightArc?: string;
}

export interface SuitAnatomyItem {
  readonly code: SuitCode;
  readonly order: 1 | 2 | 3 | 4;
  readonly displayName: string;
  readonly shortHint: string;
  readonly countBadge: string;
  readonly deckColorLabel: 'Negro' | 'Rojo';
  readonly parityLabel: 'Impar' | 'Par';
  readonly inkHex: string;
  readonly cardTintBg: string;
  readonly cardTintBorder: string;
  readonly featureKindLabel: string;
  readonly explanation: string;
  readonly stemNote: boolean;
  readonly markers: readonly SuitPointMarker[];
}

export const SUIT_ANATOMY_ITEMS: readonly SuitAnatomyItem[] = [
  {
    code: 'P',
    order: 1,
    displayName: 'Picas',
    shortHint: '1 punta aguda arriba',
    countBadge: '1 punta',
    deckColorLabel: 'Negro',
    parityLabel: 'Impar',
    inkHex: '#18181b',
    cardTintBg: '#f8fafc',
    cardTintBorder: '#cbd5e1',
    featureKindLabel: '1 pico superior',
    explanation:
      'La pica culmina arriba en una única punta afilada. Su pequeño pie inferior actúa solo como base o tallo de apoyo, por lo que representa el número 1.',
    stemNote: true,
    markers: [
      {
        number: 1,
        label: 'Punta superior única',
        tipX: 110,
        tipY: 44,
        badgeX: 110,
        badgeY: 16,
        lineX1: 110,
        lineY1: 27.5,
        lineX2: 110,
        lineY2: 40,
      },
    ],
  },
  {
    code: 'C',
    order: 2,
    displayName: 'Corazones',
    shortHint: '2 curvas superiores',
    countBadge: '2 sobresalientes',
    deckColorLabel: 'Rojo',
    parityLabel: 'Par',
    inkHex: '#e11d48',
    cardTintBg: '#fff1f2',
    cardTintBorder: '#fecdd3',
    featureKindLabel: '2 curvas / lóbulos superiores',
    explanation:
      'Al mirar la parte superior del corazón destacan claramente dos lóbulos o curvas redondeadas que sobresalen en paralelo, dándole el valor 2.',
    stemNote: false,
    markers: [
      {
        number: 1,
        label: 'Sobresaliente izquierdo',
        tipX: 80,
        tipY: 39,
        badgeX: 68,
        badgeY: 15,
        lineX1: 72,
        lineY1: 25.5,
        lineX2: 78,
        lineY2: 35.5,
        highlightArc: 'M 49 58 C 54 41, 66 33, 80 33 C 92 33, 101 38, 106 47',
      },
      {
        number: 2,
        label: 'Sobresaliente derecho',
        tipX: 140,
        tipY: 39,
        badgeX: 152,
        badgeY: 15,
        lineX1: 148,
        lineY1: 25.5,
        lineX2: 142,
        lineY2: 35.5,
        highlightArc: 'M 114 47 C 119 38, 128 33, 140 33 C 154 33, 166 41, 171 58',
      },
    ],
  },
  {
    code: 'T',
    order: 3,
    displayName: 'Tréboles',
    shortHint: '3 hojas redondeadas',
    countBadge: '3 sobresalientes',
    deckColorLabel: 'Negro',
    parityLabel: 'Impar',
    inkHex: '#18181b',
    cardTintBg: '#f8fafc',
    cardTintBorder: '#cbd5e1',
    featureKindLabel: '3 hojas sobresalientes',
    explanation:
      'El trébol despliega tres hojas bien diferenciadas (una arriba y dos a los lados). Igual que en la pica, el tallo inferior es solo el pie y no se cuenta: valor 3.',
    stemNote: true,
    markers: [
      {
        number: 1,
        label: 'Hoja superior',
        tipX: 110,
        tipY: 44.5,
        badgeX: 110,
        badgeY: 16,
        lineX1: 110,
        lineY1: 27.5,
        lineX2: 110,
        lineY2: 40.5,
        highlightArc: 'M 86.2 51.4 A 29 29 0 0 1 133.8 51.4',
      },
      {
        number: 2,
        label: 'Hoja izquierda',
        tipX: 57.5,
        tipY: 107,
        badgeX: 25,
        badgeY: 107,
        lineX1: 36.5,
        lineY1: 107,
        lineX2: 53.5,
        lineY2: 107,
        highlightArc: 'M 64.4 83.2 A 29 29 0 0 0 64.4 130.8',
      },
      {
        number: 3,
        label: 'Hoja derecha',
        tipX: 162.5,
        tipY: 107,
        badgeX: 195,
        badgeY: 107,
        lineX1: 183.5,
        lineY1: 107,
        lineX2: 166.5,
        lineY2: 107,
        highlightArc: 'M 155.6 83.2 A 29 29 0 0 1 155.6 130.8',
      },
    ],
  },
  {
    code: 'D',
    order: 4,
    displayName: 'Diamantes (Rombos)',
    shortHint: '4 esquinas o vértices',
    countBadge: '4 puntas',
    deckColorLabel: 'Rojo',
    parityLabel: 'Par',
    inkHex: '#e11d48',
    cardTintBg: '#fff1f2',
    cardTintBorder: '#fecdd3',
    featureKindLabel: '4 puntas o esquinas',
    explanation:
      'El diamante o rombo es una figura geométrica de cuatro vértices afilados (arriba, derecha, abajo e izquierda), lo que lo asocia de inmediato con el número 4.',
    stemNote: false,
    markers: [
      {
        number: 1,
        label: 'Punta superior',
        tipX: 110,
        tipY: 44,
        badgeX: 110,
        badgeY: 15,
        lineX1: 110,
        lineY1: 26.5,
        lineX2: 110,
        lineY2: 40,
      },
      {
        number: 2,
        label: 'Punta derecha',
        tipX: 156,
        tipY: 100,
        badgeX: 192,
        badgeY: 100,
        lineX1: 180.5,
        lineY1: 100,
        lineX2: 160,
        lineY2: 100,
      },
      {
        number: 3,
        label: 'Punta inferior',
        tipX: 110,
        tipY: 156,
        badgeX: 110,
        badgeY: 185,
        lineX1: 110,
        lineY1: 173.5,
        lineX2: 110,
        lineY2: 160,
      },
      {
        number: 4,
        label: 'Punta izquierda',
        tipX: 64,
        tipY: 100,
        badgeX: 28,
        badgeY: 100,
        lineX1: 39.5,
        lineY1: 100,
        lineX2: 60,
        lineY2: 100,
      },
    ],
  },
] as const;

@Component({
  selector: 'app-suit-points-diagram',
  imports: [SuitIcon],
  templateUrl: './suit-points-diagram.html',
  styleUrl: './suit-points-diagram.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuitPointsDiagram {
  protected readonly items = SUIT_ANATOMY_ITEMS;
  readonly selectedSuit = signal<SuitCode>('P');
  readonly showMarkers = signal<boolean>(true);

  protected readonly selectedItem = computed<SuitAnatomyItem>(
    () => SUIT_ANATOMY_ITEMS.find((item) => item.code === this.selectedSuit()) ?? SUIT_ANATOMY_ITEMS[0],
  );

  protected readonly nextSuitMeta = computed(() => {
    const nextCode = getNextSuit(this.selectedSuit(), 1);
    return SUIT_BY_CODE[nextCode];
  });

  protected readonly twinSuitMeta = computed(() => {
    const twinCode = getNextSuit(this.selectedSuit(), 2);
    return SUIT_BY_CODE[twinCode];
  });

  selectSuit(code: SuitCode): void {
    this.selectedSuit.set(code);
  }

  toggleMarkers(): void {
    this.showMarkers.update((visible) => !visible);
  }
}

