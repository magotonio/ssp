import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SspCard } from '../../../ssp/ssp-stack';
import { SuitIcon } from '../../../ssp/suit-icon';
import { getCardDeckInkHex } from '../../lesson4/next-card-trainer';

/** Ficha compacta de una carta (índice + palo) reutilizada por los demos de los principios. */
@Component({
  selector: 'app-card-chip',
  imports: [SuitIcon],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-300 font-bold text-sm tabular-nums"
      [style.color]="ink()"
    >
      <span class="sr-only">{{ card().fullName }}</span>
      <span aria-hidden="true">{{ card().rank }}</span>
      <app-suit-icon aria-hidden="true" [suit]="card().suit" />
      @if (showPosition()) {
        <span class="text-[11px] font-semibold text-slate-500" aria-hidden="true">
          #{{ card().position }}
        </span>
      }
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardChip {
  readonly card = input.required<SspCard>();
  readonly showPosition = input<boolean>(false);

  protected readonly ink = computed<string>(() => getCardDeckInkHex(this.card().suit));
}

