import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SuitCode } from './ssp-stack';

const SUIT_PATHS: Readonly<Record<SuitCode, string>> = {
  P: 'M12 2C7.5 7.2 3 10.6 3 14.5 3 17.1 5 19 7.5 19c1.6 0 3-.8 3.8-2.1-.2 1.8-.9 3.3-2.3 4.1h6c-1.4-.8-2.1-2.3-2.3-4.1.8 1.3 2.2 2.1 3.8 2.1 2.5 0 4.5-1.9 4.5-4.5C21 10.6 16.5 7.2 12 2z',
  C: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  T: 'M12 3a4.2 4.2 0 0 0-3.7 6.2A4.3 4.3 0 0 0 3 13.5 4.3 4.3 0 0 0 7.3 17.8c1.4 0 2.7-.7 3.5-1.8-.2 1.9-.9 3.7-2.3 4.5h7c-1.4-.8-2.1-2.6-2.3-4.5.8 1.1 2.1 1.8 3.5 1.8A4.3 4.3 0 0 0 21 13.5a4.3 4.3 0 0 0-5.3-4.3A4.2 4.2 0 0 0 12 3z',
  D: 'M12 2 20.5 12 12 22 3.5 12 12 2z',
};

@Component({
  selector: 'app-suit-icon',
  template:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path [attr.d]="paths[suit()]" /></svg>',
  styles:
    ':host { display: inline-flex; width: 16px; height: 16px; flex-shrink: 0; } svg { width: 100%; height: 100%; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuitIcon {
  readonly suit = input.required<SuitCode>();
  protected readonly paths = SUIT_PATHS;
}

