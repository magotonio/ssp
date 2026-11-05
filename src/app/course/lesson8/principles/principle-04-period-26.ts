import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SspCard, SUIT_BY_CODE } from '../../../ssp/ssp-stack';
import { CardChip } from './card-chip';
import { PositionSlider } from './position-slider';
import { advanceSuit, cardAtPosition } from './principle-helpers';

@Component({
  selector: 'app-principle-04-period-26',
  imports: [CardChip, PositionSlider],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      A media baraja (26 cartas) está la <strong>carta homónima</strong>: mismo índice y mismo
      color. Los palos gemelos son Picas ↔ Tréboles (negros) y Corazones ↔ Diamantes (rojos).
    </p>

    <app-position-slider [(position)]="position" />

    <div
      class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      <div class="flex flex-wrap items-center gap-2 text-sm text-slate-800">
        <app-card-chip [card]="card()" [showPosition]="true" />
        <span>+ 26 →</span>
        <app-card-chip [card]="twin()" [showPosition]="true" />
      </div>
      <p class="text-[13px] text-slate-600">
        Gemelas: {{ suitName(card()) }} ↔ {{ suitName(twin()) }}
        @if (twin().suit === expectedSuit()) {
          (dos palos de distancia, mismo color).
        }
      </p>
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle04Period26 {
  protected readonly position = signal<number>(1);

  protected readonly card = computed<SspCard>(() => cardAtPosition(this.position()));
  protected readonly twin = computed<SspCard>(() => cardAtPosition(this.position() + 26));
  protected readonly expectedSuit = computed(() => advanceSuit(this.card().suit, 2));

  protected suitName(card: SspCard): string {
    return SUIT_BY_CODE[card.suit].pluralName;
  }
}
