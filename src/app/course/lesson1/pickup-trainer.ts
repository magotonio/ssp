import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  output,
  signal,
} from '@angular/core';
import { Icon } from '../../icon';
import { DECK_SIZE, SspCard, SUIT_BY_CODE, SuitMeta } from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';
import {
  AssemblyPile,
  BeatWord,
  PICKUP_STEPS,
  PickupBeat,
  PickupStep,
  TABLE_PILES_LEFT_TO_RIGHT,
} from './lesson1-assembly';

export type CadenceSpeed = 'comfortable' | 'fluid' | 'demo';

interface CadenceOption {
  readonly id: CadenceSpeed;
  readonly label: string;
  readonly intervalMs: number;
}

interface PileLiveState {
  readonly pile: AssemblyPile;
  readonly remainingCount: number;
  readonly visibleTopCard: SspCard | null;
  readonly topSuitMeta: SuitMeta | null;
  readonly isJustPickedFrom: boolean;
  readonly isNextToPick: boolean;
}

interface SequenceChip {
  readonly stepNumber: number;
  readonly beatWord: BeatWord;
  readonly card: SspCard;
  readonly suitMeta: SuitMeta;
  readonly isLatest: boolean;
}

const CADENCE_OPTIONS: readonly CadenceOption[] = [
  { id: 'comfortable', label: 'Manos (2,2 s)', intervalMs: 2200 },
  { id: 'fluid', label: 'Fluida (1,3 s)', intervalMs: 1300 },
  { id: 'demo', label: 'Vista rápida', intervalMs: 380 },
] as const;

@Component({
  selector: 'app-pickup-trainer',
  imports: [Icon, SuitIcon],
  templateUrl: './pickup-trainer.html',
  styleUrl: './pickup-trainer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupTrainer {
  private readonly destroyRef = inject(DestroyRef);
  private timerId: ReturnType<typeof setInterval> | null = null;

  readonly completedDeck = output<void>();

  protected readonly deckSize = DECK_SIZE;
  protected readonly cadenceOptions = CADENCE_OPTIONS;
  protected readonly suitByCode = SUIT_BY_CODE;

  readonly currentStep = signal<number>(0);
  readonly isPlaying = signal<boolean>(false);
  readonly cadence = signal<CadenceSpeed>('comfortable');

  protected readonly latestPickedStep = computed<PickupStep | null>(() => {
    const step = this.currentStep();
    if (step <= 0) {
      return null;
    }
    return PICKUP_STEPS[step - 1] ?? null;
  });

  protected readonly nextPickupStep = computed<PickupStep | null>(() => {
    const step = this.currentStep();
    if (step >= DECK_SIZE) {
      return null;
    }
    return PICKUP_STEPS[step] ?? null;
  });

  protected readonly handTopSuitMeta = computed<SuitMeta | null>(() => {
    const latest = this.latestPickedStep();
    return latest ? SUIT_BY_CODE[latest.card.suit] : null;
  });

  protected readonly livePiles = computed<readonly PileLiveState[]>(() => {
    const stepCount = this.currentStep();
    const latestBeat: PickupBeat | null = this.latestPickedStep()?.pickupBeat ?? null;
    const nextBeat: PickupBeat | null = this.nextPickupStep()?.pickupBeat ?? null;

    // Cuántas cartas se han retirado de cada montón hasta currentStep
    const takenByBeat: Record<PickupBeat, number> = { 1: 0, 2: 0, 3: 0 };
    for (let i = 0; i < stepCount; i++) {
      takenByBeat[PICKUP_STEPS[i].pickupBeat]++;
    }

    return TABLE_PILES_LEFT_TO_RIGHT.map((pile) => {
      const taken = takenByBeat[pile.pickupBeat];
      const remainingCount = Math.max(0, pile.cardCount - taken);
      const visibleTopCard =
        remainingCount > 0 ? (pile.cardsTopToBottom[taken] ?? null) : null;
      const topSuitMeta = visibleTopCard ? SUIT_BY_CODE[visibleTopCard.suit] : null;

      return {
        pile,
        remainingCount,
        visibleTopCard,
        topSuitMeta,
        isJustPickedFrom: latestBeat === pile.pickupBeat,
        isNextToPick: nextBeat === pile.pickupBeat,
      };
    });
  });

  protected readonly recentPickedChips = computed<readonly SequenceChip[]>(() => {
    const count = this.currentStep();
    if (count === 0) {
      return [];
    }
    const startIdx = Math.max(0, count - 13);
    const items: SequenceChip[] = [];
    for (let i = startIdx; i < count; i++) {
      const step = PICKUP_STEPS[i];
      items.push({
        stepNumber: step.stepNumber,
        beatWord: step.beatWord,
        card: step.card,
        suitMeta: SUIT_BY_CODE[step.card.suit],
        isLatest: i === count - 1,
      });
    }
    return items;
  });

  protected readonly promptMessage = computed<{
    readonly badge: string;
    readonly title: string;
    readonly detail: string;
    readonly isDone: boolean;
  }>(() => {
    const count = this.currentStep();
    const latest = this.latestPickedStep();
    const next = this.nextPickupStep();

    if (count === 0 && next) {
      return {
        badge: 'LISTO PARA RECOGER · 0/52',
        title: `Empieza diciendo «UNO»: toma el ${next.card.fullName} (izquierda)`,
        detail:
          'Sujétalo cara arriba en tu mano receptora. Cada carta siguiente irá cara arriba encima de la anterior.',
        isDone: false,
      };
    }

    if (count >= DECK_SIZE && latest) {
      return {
        badge: '¡52 CARTAS RECOGIDAS!',
        title: `Última carta colocada: ${latest.card.fullName} arriba en tu mano`,
        detail:
          'Cuadra el paquete de 52 cartas y voltéalo completo dorso arriba: tu baraja física ya está en ordenación SSP.',
        isDone: true,
      };
    }

    if (latest && next) {
      return {
        badge: `«${latest.beatWord}» · RONDA ${latest.roundNumber}/18 · CARTA ${count}/52`,
        title: `En tu mano (cara arriba): ${latest.card.fullName}`,
        detail: `Siguiente tiempo «${next.beatWord}» (${next.tablePositionShort.toLowerCase()}): toma el ${next.card.fullName} y ponlo cara arriba encima.`,
        isDone: false,
      };
    }

    return {
      badge: 'RECOGIDA',
      title: 'Recogida alternada',
      detail: '',
      isDone: false,
    };
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.stopPlayback());
  }

  togglePlayback(): void {
    if (this.isPlaying()) {
      this.stopPlayback();
      return;
    }

    if (this.currentStep() >= DECK_SIZE) {
      this.currentStep.set(0);
    }

    this.startPlayback();
  }

  stepForward(): void {
    this.stopPlayback();
    this.advanceTo(Math.min(DECK_SIZE, this.currentStep() + 1));
  }

  stepForwardTrio(): void {
    this.stopPlayback();
    const current = this.currentStep();
    if (current >= DECK_SIZE) {
      return;
    }
    // Completa el trío actual («UNO, DOS, TRES») o avanza las 3 siguientes
    const remainder = current % 3;
    const delta = remainder === 0 ? 3 : 3 - remainder;
    this.advanceTo(Math.min(DECK_SIZE, current + delta));
  }

  stepBackward(): void {
    this.stopPlayback();
    this.currentStep.set(Math.max(0, this.currentStep() - 1));
  }

  resetTrainer(): void {
    this.stopPlayback();
    this.currentStep.set(0);
  }

  jumpToStep(step: number): void {
    this.stopPlayback();
    const clamped = Math.max(0, Math.min(DECK_SIZE, step));
    this.advanceTo(clamped);
  }

  setCadence(newCadence: CadenceSpeed): void {
    this.cadence.set(newCadence);
    if (this.isPlaying()) {
      this.stopPlayback();
      this.startPlayback();
    }
  }

  private advanceTo(targetStep: number): void {
    this.currentStep.set(targetStep);
    if (targetStep === DECK_SIZE) {
      this.completedDeck.emit();
    }
  }

  private startPlayback(): void {
    this.isPlaying.set(true);
    const intervalMs =
      CADENCE_OPTIONS.find((opt) => opt.id === this.cadence())?.intervalMs ?? 2200;

    if (this.currentStep() === 0) {
      this.advanceTo(1);
    }

    this.timerId = setInterval(() => {
      const next = this.currentStep() + 1;
      if (next >= DECK_SIZE) {
        this.advanceTo(DECK_SIZE);
        this.stopPlayback();
        return;
      }
      this.advanceTo(next);
    }, intervalMs);
  }

  private stopPlayback(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPlaying.set(false);
  }
}

