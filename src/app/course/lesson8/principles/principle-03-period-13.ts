import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SspCard, SUIT_BY_CODE } from '../../../ssp/ssp-stack';
import { CardChip } from './card-chip';
import { PositionSlider } from './position-slider';
import { advanceSuit, cardAtPosition } from './principle-helpers';

@Component({
  selector: 'app-principle-03-period-13',
  imports: [CardChip, PositionSlider],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      Trece cartas después reaparece <strong>el mismo índice</strong> y el palo avanza un paso en el
      orden canónico (Picas → Corazones → Tréboles → Diamantes).
    </p>

    <app-position-slider [(position)]="position" />

    <div
      class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      <div class="flex flex-wrap items-center gap-2 text-sm text-slate-800">
        <app-card-chip [card]="card()" [showPosition]="true" />
        <span>+ 13 →</span>
        <app-card-chip [card]="later()" [showPosition]="true" />
      </div>
      <p class="text-[13px] text-slate-600">
        Mismo índice ({{ card().rank }}) y palo {{ suitName(card()) }} → {{ suitName(later()) }}
        @if (later().suit === expectedSuit()) {
          (avanza 1 palo).
        }
      </p>
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle03Period13 {
  protected readonly position = signal<number>(1);

  protected readonly card = computed<SspCard>(() => cardAtPosition(this.position()));
  protected readonly later = computed<SspCard>(() => cardAtPosition(this.position() + 13));
  protected readonly expectedSuit = computed(() => advanceSuit(this.card().suit, 1));

  protected suitName(card: SspCard): string {
    return SUIT_BY_CODE[card.suit].pluralName;
  }
}
