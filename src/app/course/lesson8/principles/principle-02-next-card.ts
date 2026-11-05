import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { getNextSspCard, SspCard, SUIT_BY_CODE } from '../../../ssp/ssp-stack';
import { CardChip } from './card-chip';
import { PositionSlider } from './position-slider';
import { cardAtPosition } from './principle-helpers';

interface NextCardExplanation {
  readonly valueOperation: string;
  readonly suitOperation: string;
}

@Component({
  selector: 'app-principle-02-next-card',
  imports: [CardChip, PositionSlider],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      Para la carta siguiente restas <strong>4</strong> al índice y avanzas <strong>1 palo</strong>.
      Si el índice es <strong>4 o menos</strong>, sumas <strong>9</strong> y avanzas
      <strong>2 palos</strong>.
    </p>

    <app-position-slider [(position)]="position" />

    <div
      class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      <div class="flex flex-wrap items-center gap-2 text-sm text-slate-800">
        <app-card-chip [card]="card()" [showPosition]="true" />
        <span>→</span>
        <app-card-chip [card]="next()" [showPosition]="true" />
      </div>
      <p class="text-[13px] text-slate-600">
        <strong>Índice:</strong> {{ explanation().valueOperation }} ·
        <strong>Palo:</strong> {{ explanation().suitOperation }}
      </p>
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle02NextCard {
  protected readonly position = signal<number>(1);

  protected readonly card = computed<SspCard>(() => cardAtPosition(this.position()));
  protected readonly next = computed<SspCard>(() => getNextSspCard(this.card()));

  protected readonly explanation = computed<NextCardExplanation>(() => {
    const card = this.card();
    const next = this.next();
    const isLow = card.value <= 4;
    return {
      valueOperation: isLow
        ? `${card.value} + 9 = ${next.value}`
        : `${card.value} − 4 = ${next.value}`,
      suitOperation: `${SUIT_BY_CODE[card.suit].pluralName} + ${isLow ? 2 : 1} → ${SUIT_BY_CODE[next.suit].pluralName}`,
    };
  });
}
