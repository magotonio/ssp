import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SspCard } from '../../../ssp/ssp-stack';
import { getInternalPosition } from '../../lesson6/internal-position-trainer';
import { CardChip } from './card-chip';
import { PositionSlider } from './position-slider';
import { cardAtPosition } from './principle-helpers';

@Component({
  selector: 'app-principle-11-three-sum',
  imports: [CardChip, PositionSlider],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      Suma los valores de <strong>tres cartas consecutivas</strong> y réstale
      <strong>14</strong>: obtienes la posición interna (1–13) de la primera carta del trío.
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
      <code class="font-mono text-[13px] font-bold tabular-nums">
        {{ valuesText() }} = {{ sum() }} → {{ sum() }} − 14 = {{ result() }}
      </code>
      <p class="text-[13px] text-slate-600">
        La posición interna de {{ trio()[0].rank }} es
        <strong>{{ expected() }}.ª</strong>
        @if (result() === expected()) {
          · coincide.
        }
      </p>
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle11ThreeSum {
  protected readonly position = signal<number>(1);

  protected readonly trio = computed<readonly SspCard[]>(() =>
    Array.from({ length: 3 }, (_, i) => cardAtPosition(this.position() + i)),
  );
  protected readonly sum = computed<number>(() =>
    this.trio().reduce((total, card) => total + card.value, 0),
  );
  protected readonly result = computed<number>(() => this.sum() - 14);
  protected readonly expected = computed<number>(() => getInternalPosition(this.trio()[0].value));
  protected readonly valuesText = computed<string>(() =>
    this.trio()
      .map((card) => card.value)
      .join(' + '),
  );
}
