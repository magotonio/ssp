import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CardValue, SSP_STACK, SspCard } from '../../../ssp/ssp-stack';
import { suitColor } from './principle-helpers';

export interface TetradOption {
  readonly id: string;
  readonly label: string;
  readonly values: readonly CardValue[];
  readonly description: string;
}

export const WORKING_TETRADS: readonly TetradOption[] = [
  {
    id: '10-k',
    label: '10, J, Q, K',
    values: [10, 11, 12, 13],
    description: 'Empieza en el 10',
  },
  {
    id: 'j-a',
    label: 'J, Q, K, As',
    values: [11, 12, 13, 1],
    description: 'Empieza en la Jota',
  },
  {
    id: 'q-2',
    label: 'Q, K, As, 2',
    values: [12, 13, 1, 2],
    description: 'Empieza en la Reina',
  },
  {
    id: 'k-3',
    label: 'K, As, 2, 3',
    values: [13, 1, 2, 3],
    description: 'Empieza en el Rey',
  },
  {
    id: 'a-4',
    label: 'As, 2, 3, 4',
    values: [1, 2, 3, 4],
    description: 'Empieza en el As',
  },
] as const;

@Component({
  selector: 'app-principle-12-colors',
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      Al retirar <strong>4 índices específicos</strong> con sus respectivos palos (16 cartas en total), las
      <strong>36 cartas</strong> restantes adquieren una alternancia perfecta de color rojo y negro.
      Existen 5 grupos válidos (que comienzan entre el 10 y el As): pulsa cualquiera de ellos para retirarlo y comprobar la alternancia.
    </p>

    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Grupos de 4 índices para retirar">
        @for (tetrad of tetradOptions; track tetrad.id) {
          <button
            type="button"
            class="min-h-9 px-3 rounded-md border text-[13px] font-bold cursor-pointer transition-colors"
            [class.bg-slate-900]="selectedTetrad()?.id === tetrad.id"
            [class.text-white]="selectedTetrad()?.id === tetrad.id"
            [class.border-slate-900]="selectedTetrad()?.id === tetrad.id"
            [class.bg-white]="selectedTetrad()?.id !== tetrad.id"
            [class.text-slate-800]="selectedTetrad()?.id !== tetrad.id"
            [class.border-slate-300]="selectedTetrad()?.id !== tetrad.id"
            [attr.aria-pressed]="selectedTetrad()?.id === tetrad.id"
            (click)="selectTetrad(tetrad)"
          >
            Retirar {{ tetrad.label }}
          </button>
        }
        @if (selectedTetrad() !== null) {
          <button
            type="button"
            class="min-h-9 px-3 rounded-md border border-slate-300 bg-white text-[13px] font-semibold text-slate-600 cursor-pointer hover:bg-slate-50"
            (click)="reset()"
          >
            Restaurar todas
          </button>
        }
      </div>
    </div>

    <ol
      class="grid grid-cols-8 sm:grid-cols-13 gap-1"
      [attr.aria-label]="'Secuencia de ' + remaining().length + ' cartas'"
    >
      @for (card of cards; track card.position) {
        <li
          class="min-h-8 flex items-center justify-center rounded-md text-[12px] font-bold text-white transition-opacity"
          [class.bg-zinc-900]="color(card) === 'black'"
          [class.bg-rose-600]="color(card) === 'red'"
          [class.opacity-15]="isRemoved(card.value)"
          [attr.aria-hidden]="isRemoved(card.value)"
        >
          {{ card.rank }}
        </li>
      }
    </ol>

    <div
      class="p-3.5 rounded-[10px] bg-white border border-slate-200 text-[13px] text-slate-700 flex flex-col gap-1"
      role="status"
      aria-live="polite"
    >
      @if (selectedTetrad() === null) {
        Con las 52 cartas completas hay cartas seguidas del mismo color. Elige uno de los 5 grupos de 4 índices para retirarlos.
      } @else {
        <p>
          Retirados los índices <strong>{{ selectedTetrad()?.label }}</strong> (16 cartas) · Quedan <strong>{{ remaining().length }}</strong> cartas.
        </p>
        <p>
          @if (alternates()) {
            <strong class="text-[#397153]">El color alterna perfectamente rojo y negro</strong>
            en bucle cerrado continuo, sin ninguna excepción.
          }
        </p>
      }
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle12Colors {
  protected readonly tetradOptions = WORKING_TETRADS;
  protected readonly cards: readonly SspCard[] = SSP_STACK;
  protected readonly selectedTetrad = signal<TetradOption | null>(WORKING_TETRADS[4]); // A, 2, 3, 4 por defecto

  protected readonly removedValues = computed<ReadonlySet<CardValue>>(() => {
    const current = this.selectedTetrad();
    return current ? new Set(current.values) : new Set();
  });

  protected readonly remaining = computed<readonly SspCard[]>(() =>
    this.cards.filter((card) => !this.removedValues().has(card.value)),
  );

  protected readonly alternates = computed<boolean>(() => {
    const kept = this.remaining();
    return (
      kept.length > 1 &&
      kept.every((card, i) => suitColor(card.suit) !== suitColor(kept[(i + 1) % kept.length].suit))
    );
  });

  protected isRemoved(value: CardValue): boolean {
    return this.removedValues().has(value);
  }

  protected selectTetrad(tetrad: TetradOption): void {
    if (this.selectedTetrad()?.id === tetrad.id) {
      this.selectedTetrad.set(null);
    } else {
      this.selectedTetrad.set(tetrad);
    }
  }

  protected reset(): void {
    this.selectedTetrad.set(null);
  }

  protected color(card: SspCard): 'black' | 'red' {
    return suitColor(card.suit);
  }
}
