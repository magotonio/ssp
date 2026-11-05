import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { getSspCardByValueAndSuit, SspCard } from '../../../ssp/ssp-stack';
import { CardChip } from './card-chip';
import { PositionSlider } from './position-slider';
import { cardAtPosition, forwardDistance, nextValueSameSuitPosition } from './principle-helpers';

@Component({
  selector: 'app-principle-08-distance-three',
  imports: [CardChip, PositionSlider],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      Las cartas de un mismo palo se suceden de As a Rey a una distancia fija de
      <strong>3 posiciones</strong>. La única ruptura es el salto del Rey al As, que cae en otro
      tramo de la baraja.
    </p>

    <app-position-slider [(position)]="position" />

    <div
      class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      <div class="flex flex-wrap items-center gap-2 text-sm text-slate-800">
        <app-card-chip [card]="card()" [showPosition]="true" />
        @if (successor(); as next) {
          <span>→ siguiente índice del mismo palo:</span>
          <app-card-chip [card]="next" [showPosition]="true" />
        } @else {
          <span>→ tras el Rey vuelve el As del mismo palo:</span>
          <app-card-chip [card]="aceOfSuit()" [showPosition]="true" />
        }
      </div>
      <p class="text-[13px] text-slate-600">
        Distancia: <strong class="tabular-nums">{{ distance() }}</strong>
        posiciones
        @if (successor()) {
          (siempre 3).
        } @else {
          (único salto distinto).
        }
      </p>
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle08DistanceThree {
  protected readonly position = signal<number>(29);

  protected readonly card = computed<SspCard>(() => cardAtPosition(this.position()));

  protected readonly successor = computed<SspCard | null>(() => {
    const target = nextValueSameSuitPosition(this.card());
    return target === null ? null : cardAtPosition(target);
  });

  protected readonly aceOfSuit = computed<SspCard>(() =>
    getSspCardByValueAndSuit(1, this.card().suit),
  );

  protected readonly distance = computed<number>(() => {
    const target = this.successor() ?? this.aceOfSuit();
    return forwardDistance(this.card().position, target.position);
  });
}
