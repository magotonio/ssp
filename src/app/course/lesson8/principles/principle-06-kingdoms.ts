import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SSP_STACK, SspCard } from '../../../ssp/ssp-stack';
import { getCardCharacter, getCardKingdom, KINGDOMS, KingdomMeta } from '../../lesson5/kingdom-trainer';
import { getCardDeckInkHex } from '../../lesson4/next-card-trainer';
import { CardChip } from './card-chip';

interface KingdomRow {
  readonly kingdom: KingdomMeta;
  readonly cards: readonly SspCard[];
}

@Component({
  selector: 'app-principle-06-kingdoms',
  imports: [CardChip],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      Las 52 cartas se reparten en <strong>4 reinos de 13</strong>. El reino de una carta depende de
      su palo y de su valor (Nobles, Políticos o Científicos). Pulsa cualquier carta para ver el
      suyo.
    </p>

    <div class="flex flex-col gap-2">
      @for (row of rows; track row.kingdom.order) {
        <div class="flex flex-col gap-1">
          <span class="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {{ row.kingdom.name }} · {{ row.kingdom.rangeLabel }}
          </span>
          <div class="grid grid-cols-7 sm:grid-cols-13 gap-1" role="group" [attr.aria-label]="row.kingdom.name">
            @for (card of row.cards; track card.position) {
              <button
                type="button"
                class="min-h-9 rounded-md border text-[12px] font-bold tabular-nums cursor-pointer"
                [class.border-slate-900]="selected().position === card.position"
                [class.bg-slate-900]="selected().position === card.position"
                [class.text-white]="selected().position === card.position"
                [class.border-slate-300]="selected().position !== card.position"
                [class.bg-white]="selected().position !== card.position"
                [style.color]="selected().position === card.position ? null : ink(card)"
                [attr.aria-pressed]="selected().position === card.position"
                [attr.aria-label]="'Posición ' + card.position + ': ' + card.fullName"
                (click)="selected.set(card)"
              >
                {{ card.position }}
              </button>
            }
          </div>
        </div>
      }
    </div>

    <div
      class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-wrap items-center gap-2 text-sm text-slate-800"
      role="status"
      aria-live="polite"
    >
      <app-card-chip [card]="selected()" [showPosition]="true" />
      <span>→ {{ kingdom().name }}</span>
      <span class="text-slate-500">({{ character() }})</span>
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle06Kingdoms {
  protected readonly rows: readonly KingdomRow[] = KINGDOMS.map((kingdom) => ({
    kingdom,
    cards: SSP_STACK.slice(kingdom.startPosition - 1, kingdom.endPosition),
  }));

  protected readonly selected = signal<SspCard>(SSP_STACK[0]);

  protected readonly kingdom = computed<KingdomMeta>(() => getCardKingdom(this.selected()));
  protected readonly character = computed<string>(
    () => getCardCharacter(this.selected().value).singularName,
  );

  protected ink(card: SspCard): string {
    return getCardDeckInkHex(card.suit);
  }
}
