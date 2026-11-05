import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getNextSspCard, SSP_STACK, SspCard } from '../../../ssp/ssp-stack';
import { CardChip } from './card-chip';

@Component({
  selector: 'app-principle-05-canonical-start',
  imports: [CardChip],
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      La ordenación estándar de referencia coloca el <strong>9♠</strong> en la posición 1 y termina
      con el <strong>K♦</strong> en la 52. Esas dos cartas fijan el marco de coordenadas absolutas.
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-col gap-2">
        <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Posición 1</span>
        <app-card-chip [card]="first" [showPosition]="true" />
      </div>
      <div class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-col gap-2">
        <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Posición 52</span>
        <app-card-chip [card]="last" [showPosition]="true" />
      </div>
      <div class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-col gap-2">
        <span class="text-xs font-bold uppercase tracking-wide text-slate-500">
          Tras la 52 (cierre del ciclo)
        </span>
        <app-card-chip [card]="afterLast" [showPosition]="true" />
      </div>
    </div>

    <p class="text-[13px] text-slate-600">
      Al aplicar la regla de la carta siguiente al K♦ se obtiene de nuevo el 9♠: el ciclo se cierra
      con un periodo de 52 cartas.
    </p>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle05CanonicalStart {
  protected readonly first: SspCard = SSP_STACK[0];
  protected readonly last: SspCard = SSP_STACK[SSP_STACK.length - 1];
  protected readonly afterLast: SspCard = getNextSspCard(this.last);
}
