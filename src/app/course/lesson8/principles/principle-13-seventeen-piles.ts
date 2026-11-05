import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CardChip } from './card-chip';
import { buildSeventeenPiles, SeventeenPilesResult } from './principle-helpers';

@Component({
  selector: 'app-principle-13-seventeen-piles',
  imports: [CardChip],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      Con la baraja organizada por palos (Picas, Corazones, Tréboles y Diamantes, cada uno de Rey a
      As), repártela de una en una en <strong>17 montones</strong> correlativos y recógelos en
      orden: la ordenación SSP completa aparece sin calcular nada.
    </p>

    <button
      type="button"
      class="self-start min-h-10 px-4 rounded-lg border border-slate-900 bg-slate-900 text-white text-[13px] font-semibold cursor-pointer hover:bg-slate-700"
      [attr.aria-pressed]="gathered()"
      (click)="gathered.set(!gathered())"
    >
      {{ gathered() ? 'Volver a ver los montones' : 'Recoger los montones' }}
    </button>

    @if (gathered()) {
      <div class="flex flex-col gap-2" role="status" aria-live="polite">
        <span class="text-xs font-bold uppercase tracking-wide text-slate-500">
          Resultado (de arriba abajo): montones 17 → 1
        </span>
        <ol class="flex flex-wrap gap-1.5">
          @for (card of result.gathered; track card.code) {
            <li><app-card-chip [card]="card" [showPosition]="true" /></li>
          }
        </ol>
        <p class="text-[13px] text-slate-600">
          Es la ordenación SSP completa, cortada por el Rey de Picas (#13).
        </p>
      </div>
    } @else {
      <ol class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        @for (pile of result.piles; track $index) {
          <li class="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col gap-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Montón {{ $index + 1 }}
            </span>
            <div class="flex flex-wrap gap-1">
              @for (card of pile; track card.code) {
                <app-card-chip [card]="card" />
              }
            </div>
          </li>
        }
      </ol>
    }
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle13SeventeenPiles {
  protected readonly result: SeventeenPilesResult = buildSeventeenPiles();
  protected readonly gathered = signal<boolean>(false);
}
