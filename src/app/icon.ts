import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const paths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  book: 'M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1v15',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  arrowLeft: 'M19 12H5m5 5-5-5 5-5',
  cards: 'M7 3h13v17H7ZM4 6H2v16h13',
  cycle: 'M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5M4 17a9 9 0 0 0 15 2l3-3m0 5v-5h-5',
  star: 'm12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z',
  play: 'm8 5 11 7-11 7Z',
  pause: 'M7 5h3v14H7ZM14 5h3v14h-3Z',
  stepForward: 'm6 5 8 7-8 7V5Zm11 0v14',
  stepBack: 'm18 5-8 7 8 7V5ZM7 5v14',
  reset: 'M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5',
  check: 'm5 12 4 4L19 6',
  chevronLeft: 'm15 19-7-7 7-7',
  chevronRight: 'm9 5 7 7-7 7',
  info: 'M12 11v6m0-10v1M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0',
  clock: 'M12 6v6l4 2M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0',
} as const;

export type IconName = keyof typeof paths;

@Component({
  selector: 'app-icon',
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[name()]" /></svg>',
  styles:
    ':host { display: inline-flex; width: 20px; height: 20px; flex-shrink: 0; } svg { width: 100%; height: 100%; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly paths = paths;
}
