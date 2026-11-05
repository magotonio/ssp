import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

let nextSliderId = 0;

/** Control deslizante para elegir una posición (1–52) de la ordenación SSP. */
@Component({
  selector: 'app-position-slider',
  template: `
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-bold uppercase tracking-wide text-slate-500" [for]="inputId">
        {{ label() }}: <span class="text-slate-900 tabular-nums">{{ position() }}</span>
      </label>
      <input
        type="range"
        class="w-full accent-slate-800"
        [id]="inputId"
        [min]="min()"
        [max]="max()"
        step="1"
        [value]="position()"
        (input)="onInput($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionSlider {
  readonly label = input<string>('Posición de la carta');
  readonly min = input<number>(1);
  readonly max = input<number>(52);
  readonly position = model.required<number>();

  protected readonly inputId = `position-slider-${nextSliderId++}`;

  protected onInput(event: Event): void {
    this.position.set(Number((event.target as HTMLInputElement).value));
  }
}

