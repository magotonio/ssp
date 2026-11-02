import { Component, input } from '@angular/core';

const paths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  book: 'M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1v15',
  brain: 'M12 18V5a3 3 0 0 0-5-2 4 4 0 0 0-4 5 4 4 0 0 0 0 7 4 4 0 0 0 4 5 3 3 0 0 0 5-2Zm0 0V5a3 3 0 0 1 5-2 4 4 0 0 1 4 5 4 4 0 0 1 0 7 4 4 0 0 1-4 5 3 3 0 0 1-5-2M7 8l2 2m8-2-2 2M6 15h3m6 0h3',
  chart: 'M4 3v18h17M8 16v-5m5 5V6m5 10v-8',
  folder: 'M3 7V4h6l3 3h9v13H3Z',
  settings: 'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  search: 'M20 20l-5-5M17 10a7 7 0 1 0-14 0 7 7 0 0 0 14 0',
  bell: 'M5 16V9a7 7 0 0 1 14 0v7l2 2H3Zm5 5h4',
  chevron: 'm9 5 7 7-7 7',
  clock: 'M12 7v5l3 2M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0',
  check: 'm5 12 4 4L19 6',
  flame: 'M13 2c1 6-5 5-3 11-2 0-3-2-3-4-7 9 2 15 7 12 7-4 4-10-1-19Z',
  plus: 'M12 5v14M5 12h14',
  play: 'm9 5 11 7-11 7Z',
  target: 'M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0M18 12a6 6 0 1 0-12 0 6 6 0 0 0 12 0M12 10v4m-2-2h4',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M6 18 18 6',
  info: 'M12 11v6m0-10v1M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0',
  cards: 'M7 3h13v17H7ZM4 6H2v16h13',
  star: 'm12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z',
} as const;

export type IconName = keyof typeof paths;

@Component({
  selector: 'app-icon',
  template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[name()]" /></svg>',
  styles: ':host { display: inline-flex; width: 20px; height: 20px; flex-shrink: 0; } svg { width: 100%; height: 100%; }',
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly paths = paths;
}
