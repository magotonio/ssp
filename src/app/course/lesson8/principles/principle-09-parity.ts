import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SspCard } from '../../../ssp/ssp-stack';
import { CardChip } from './card-chip';
import { PositionSlider } from './position-slider';
import { cardAtPosition, parityOfIndexPlusSuit, suitNumber } from './principle-helpers';

interface ParityRow {
  readonly card: SspCard;
  readonly sum: number;
  readonly parity: 'par' | 'impar';
}

@Component({
  selector: 'app-principle-09-parity',
  imports: [CardChip, PositionSlider],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      Si das valor a los palos (Picas 1, Corazones 2, Tréboles 3, Diamantes 4) y sumas
      <strong>índice + palo</strong>, el resultado alterna entre <strong>par</strong> e
      <strong>impar</strong> en cada carta sucesiva.
    </p>

    <app-position-slider label="Empezar en la posición" [(position)]="position" />

    <ol class="flex flex-col gap-1.5" aria-live="polite">
      @for (row of rows(); track row.card.position) {
        <li
          class="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg border text-sm"
          [class.bg-slate-100]="row.parity === 'par'"
          [class.border-slate-300]="row.parity === 'par'"
          [class.bg-orange-50]="row.parity === 'impar'"
          [class.border-orange-200]="row.parity === 'impar'"
        >
          <app-card-chip [card]="row.card" [showPosition]="true" />
          <code class="font-mono text-[13px] tabular-nums">
            {{ row.card.value }} + {{ suitValue(row.card) }} = {{ row.sum }}
          </code>
          <strong class="ml-auto text-[12px] uppercase tracking-wide">{{ row.parity }}</strong>
        </li>
      }
    </ol>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle09Parity {
  protected readonly position = signal<number>(1);

  protected readonly rows = computed<readonly ParityRow[]>(() =>
    Array.from({ length: 6 }, (_, i) => {
      const card = cardAtPosition(this.position() + i);
      return {
        card,
        sum: card.value + suitNumber(card.suit),
        parity: parityOfIndexPlusSuit(card),
      };
    }),
  );

  protected suitValue(card: SspCard): number {
    return suitNumber(card.suit);
  }
}
