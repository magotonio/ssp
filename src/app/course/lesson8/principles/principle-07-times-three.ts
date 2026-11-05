import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CARD_RANKS, CardValue } from '../../../ssp/ssp-stack';

import { internalPositionByTimesThree } from './principle-helpers';

@Component({
  selector: 'app-principle-07-times-three',
  template: `
    <p class="text-sm leading-relaxed text-slate-700">
      La posición (1–13) que ocupa una carta dentro de su reino es su <strong>valor × 3</strong> en
      módulo 13 (si el resultado es 0, es la posición 13).
    </p>

    <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Índice a consultar">
      @for (r of ranks; track r.value) {
        <button
          type="button"
          class="min-w-9 min-h-9 px-2 rounded-md border text-[13px] font-bold cursor-pointer"
          [class.bg-slate-900]="value() === r.value"
          [class.text-white]="value() === r.value"
          [class.border-slate-900]="value() === r.value"
          [class.bg-white]="value() !== r.value"
          [class.text-slate-800]="value() !== r.value"
          [class.border-slate-300]="value() !== r.value"
          [attr.aria-pressed]="value() === r.value"
          (click)="value.set(r.value)"
        >
          {{ r.rank }}
        </button>
      }
    </div>

    <div
      class="p-3.5 rounded-[10px] bg-white border border-slate-200 flex flex-col gap-1.5 text-sm text-slate-800"
      role="status"
      aria-live="polite"
    >
      <code class="font-mono text-[13px] font-bold">
        {{ value() }} × 3 = {{ product() }}
        @if (product() > 13) {
          → {{ product() }} mod 13 = {{ product() % 13 }}
        }
      </code>
      <p>
        El {{ rank() }} ocupa la posición interna <strong>{{ internal() }}.ª</strong> de su reino.
      </p>
    </div>
  `,
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principle07TimesThree {
  protected readonly ranks = CARD_RANKS;
  protected readonly value = signal<CardValue>(9);

  protected readonly product = computed<number>(() => this.value() * 3);
  protected readonly internal = computed<number>(() => internalPositionByTimesThree(this.value()));
  protected readonly rank = computed<string>(
    () => CARD_RANKS.find((r) => r.value === this.value())?.rank ?? '',
  );
}
