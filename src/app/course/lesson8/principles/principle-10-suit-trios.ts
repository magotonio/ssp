import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SspCard, SUIT_BY_CODE } from '../../../ssp/ssp-stack';
import { CardChip } from './card-chip';
import { PositionSlider } from './position-slider';
import { cardAtPosition } from './principle-helpers';

@Component({
  selector: 'app-principle-10-suit-trios',
  imports: [CardChip, PositionSlider],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      En <strong>cualquier trío de cartas consecutivas</strong> aparecen siempre tres palos
      distintos. Nunca se repite un palo dentro de un trío.
    </p>

    <app-position-slider label="Primera carta del trío" [(position)]="position" />

    <div
      class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      <div class="flex flex-wrap items-center gap-2 text-sm text-slate-800">
        @for (card of trio(); track card.position) {
          <app-card-chip [card]="card" [showPosition]="true" />
        }
      </div>
      <p class="text-[13px] text-slate-600">
        Palos: {{ suitNames() }} →
        <strong>{{ distinctSuits() }} palos distintos</strong>.
      </p>
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle10SuitTrios {
  protected readonly position = signal<number>(1);

  protected readonly trio = computed<readonly SspCard[]>(() =>
    Array.from({ length: 3 }, (_, i) => cardAtPosition(this.position() + i)),
  );

  protected readonly suitNames = computed<string>(() =>
    this.trio()
      .map((card) => SUIT_BY_CODE[card.suit].pluralName)
      .join(', '),
  );

  protected readonly distinctSuits = computed<number>(
    () => new Set(this.trio().map((card) => card.suit)).size,
  );
}
