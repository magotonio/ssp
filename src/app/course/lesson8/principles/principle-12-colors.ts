import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SSP_STACK, SspCard } from '../../../ssp/ssp-stack';
import { suitColor } from './principle-helpers';

const POLITICIAN_VALUES: readonly number[] = [1, 2, 3, 4];

@Component({
  selector: 'app-principle-12-colors',
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      Si retiras los cuatro <strong>Políticos</strong> (As, 2, 3 y 4), las <strong>36 cartas</strong>
      restantes alternan perfectamente rojo y negro. Actívalo y comprueba la secuencia.
    </p>

    <button
      type="button"
      class="self-start min-h-10 px-4 rounded-lg border border-slate-300 bg-white text-[13px] font-semibold cursor-pointer hover:bg-slate-50"
      [attr.aria-pressed]="removed()"
      (click)="removed.set(!removed())"
    >
      {{ removed() ? 'Devolver As, 2, 3 y 4' : 'Retirar As, 2, 3 y 4' }}
    </button>

    <ol class="grid grid-cols-8 sm:grid-cols-13 gap-1" [attr.aria-label]="'Secuencia de ' + visibleCount() + ' cartas'">
      @for (card of cards; track card.position) {
        <li
          class="min-h-8 flex items-center justify-center rounded-md text-[12px] font-bold text-white"
          [class.bg-zinc-900]="color(card) === 'black'"
          [class.bg-rose-600]="color(card) === 'red'"
          [class.opacity-15]="removed() && isPolitician(card)"
          [attr.aria-hidden]="removed() && isPolitician(card)"
        >
          {{ card.rank }}
        </li>
      }
    </ol>

    <div
      class="p-3.5 rounded-[10px] bg-white border border-slate-200 text-[13px] text-slate-700"
      role="status"
      aria-live="polite"
    >
      @if (removed()) {
        Quedan <strong>{{ visibleCount() }}</strong> cartas y el color alterna
        <strong>{{ alternates() ? 'sin ninguna excepción' : 'con excepciones' }}</strong>
        (en bucle cerrado, incluida la unión del Rey de Diamantes con el 9 de Picas).
      } @else {
        Con las 52 cartas hay tramos del mismo color seguidos (por ejemplo, tras cada Político).
      }
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle12Colors {
  protected readonly cards: readonly SspCard[] = SSP_STACK;
  protected readonly removed = signal<boolean>(false);

  protected readonly visibleCount = computed<number>(() =>
    this.removed() ? this.cards.filter((c) => !this.isPolitician(c)).length : this.cards.length,
  );

  protected readonly alternates = computed<boolean>(() => {
    const kept = this.cards.filter((c) => !this.isPolitician(c));
    return kept.every(
      (card, i) => suitColor(card.suit) !== suitColor(kept[(i + 1) % kept.length].suit),
    );
  });

  protected color(card: SspCard): 'black' | 'red' {
    return suitColor(card.suit);
  }

  protected isPolitician(card: SspCard): boolean {
    return POLITICIAN_VALUES.includes(card.value);
  }
}
