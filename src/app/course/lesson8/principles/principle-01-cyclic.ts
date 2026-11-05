import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { getNextSspCard, SspCard } from '../../../ssp/ssp-stack';
import { CardChip } from './card-chip';
import { cardAtPosition } from './principle-helpers';
import { PositionSlider } from './position-slider';

@Component({
  selector: 'app-principle-01-cyclic',
  imports: [CardChip, PositionSlider],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      La baraja es un <strong>bucle cerrado</strong>: tras la carta 52 vuelve la carta 1. Por eso
      puedes cortar donde quieras: las parejas de vecinas no cambian, solo cambia dónde está el
      «principio».
    </p>

    <app-position-slider label="Corto y queda arriba la carta de la posición" [(position)]="cut" />

    <div
      class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-col gap-3"
      role="status"
      aria-live="polite"
    >
      <div class="flex flex-wrap items-center gap-2 text-sm text-slate-800">
        <span>Abajo queda</span>
        <app-card-chip [card]="bottom()" [showPosition]="true" />
        <span>→ su carta siguiente es</span>
        <app-card-chip [card]="nextOfBottom()" [showPosition]="true" />
        <span>, justo la que ahora está arriba.</span>
      </div>
      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-bold uppercase tracking-wide text-slate-500">
          Primeras 6 cartas de la baraja cortada
        </span>
        <div class="flex flex-wrap gap-1.5">
          @for (card of firstCards(); track card.position) {
            <app-card-chip [card]="card" />
          }
        </div>
      </div>
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle01Cyclic {
  protected readonly cut = signal<number>(27);

  protected readonly top = computed<SspCard>(() => cardAtPosition(this.cut()));
  protected readonly bottom = computed<SspCard>(() => cardAtPosition(this.cut() - 1));
  protected readonly nextOfBottom = computed<SspCard>(() => getNextSspCard(this.bottom()));
  protected readonly firstCards = computed<readonly SspCard[]>(() =>
    Array.from({ length: 6 }, (_, i) => cardAtPosition(this.cut() + i)),
  );
}
