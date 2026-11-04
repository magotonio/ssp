import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Icon } from '../../icon';
import { DECK_SIZE, SSP_STACK, SspCard, SuitCode } from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';
import {
  formatStopwatchTime,
  getCardDeckInkHex,
  shuffleSspDeck,
} from '../lesson4/next-card-trainer';
import {
  AbsolutePositionBreakdown,
  describeAbsolutePosition,
} from '../lesson6/internal-position-trainer';

export type CutTrainingPhaseId = 'cut-26' | 'cut-13' | 'cut-39' | 'cycle-52';

export type CutAttemptStage =
  | 'ready'
  | 'awaiting-deviation'
  | 'out-of-tolerance'
  | 'resolved';

export type CutDeviationDirection = 'above' | 'below';

export interface CutPhaseMeta {
  readonly id: CutTrainingPhaseId;
  readonly stepNumber: 1 | 2 | 3 | 4;
  readonly shortLabel: string;
  readonly badgeLabel: string;
  readonly title: string;
  readonly description: string;
  readonly fixedTargetPosition: 26 | 13 | 39 | null;
  readonly goalCount: number;
}

export interface CutEvaluationResult {
  readonly targetCard: SspCard;
  readonly targetBreakdown: AbsolutePositionBreakdown;
  readonly cutPosition: number;
  readonly cutCard: SspCard;
  readonly cutBreakdown: AbsolutePositionBreakdown;
  readonly isExact: boolean;
  readonly signedDelta: number;
  readonly distance: number;
  readonly direction: CutDeviationDirection | null;
  readonly withinPhysicalTolerance: boolean;
}

export interface RiffleCutTrainerFeedback {
  readonly kind: 'hit' | 'miss';
  readonly heading: string;
  readonly detail: string;
}

export const CALIBRATION_CUTS_GOAL = 3;
export const PHYSICAL_TOLERANCE_CARDS = 5;

export const QUICK_DEVIATION_DISTANCES: readonly number[] = [
  1, 2, 3, 4, 5,
] as const;

export const DECK_SLOTS: readonly number[] = Array.from(
  { length: DECK_SIZE },
  (_, index) => index + 1,
);

export const CUT_TRAINING_PHASES: readonly CutPhaseMeta[] = [
  {
    id: 'cut-26',
    stepNumber: 1,
    shortLabel: 'Fase 1 · Cortar 26',
    badgeLabel: 'Mitad exacta (26)',
    title: 'Fase 1: Corte a la mitad (26 cartas · Rey de Corazones)',
    description:
      'Calibra la vista y el pulso partiendo el mazo exactamente por la mitad: la posición #26 corresponde al Rey de Corazones (cierre del 2.º reino).',
    fixedTargetPosition: 26,
    goalCount: CALIBRATION_CUTS_GOAL,
  },
  {
    id: 'cut-13',
    stepNumber: 2,
    shortLabel: 'Fase 2 · Cortar 13',
    badgeLabel: '1.er bloque (13)',
    title: 'Fase 2: Corte al primer cuarto (13 cartas · Rey de Picas)',
    description:
      'Interioriza el grosor de un único reino: cortar las primeras 13 cartas te lleva al Rey de Picas (#13, cierre del 1.er reino).',
    fixedTargetPosition: 13,
    goalCount: CALIBRATION_CUTS_GOAL,
  },
  {
    id: 'cut-39',
    stepNumber: 3,
    shortLabel: 'Fase 3 · Cortar 39',
    badgeLabel: '3.er bloque (39)',
    title: 'Fase 3: Corte al tercer cuarto (39 cartas · Rey de Tréboles)',
    description:
      'Domina los tres cuartos del mazo dejando solo 13 cartas abajo: la posición #39 corresponde al Rey de Tréboles (cierre del 3.er reino).',
    fixedTargetPosition: 39,
    goalCount: CALIBRATION_CUTS_GOAL,
  },
  {
    id: 'cycle-52',
    stepNumber: 4,
    shortLabel: 'Fase 4 · Ciclo 52 cartas',
    badgeLabel: '52 cartas al azar',
    title: 'Fase 4: Ciclo completo de 52 cartas aleatorias',
    description:
      'Prueba definitiva: las 52 cartas de la baraja aparecen mezcladas sin repetición para que deduzcas su ubicación, arrastres, riflees y cortes en ella.',
    fixedTargetPosition: null,
    goalCount: DECK_SIZE,
  },
] as const;

export const CUT_PHASE_BY_ID: Readonly<Record<CutTrainingPhaseId, CutPhaseMeta>> = {
  'cut-26': CUT_TRAINING_PHASES[0],
  'cut-13': CUT_TRAINING_PHASES[1],
  'cut-39': CUT_TRAINING_PHASES[2],
  'cycle-52': CUT_TRAINING_PHASES[3],
};

/**
 * Convierte una proporción horizontal [0..1] sobre la barra de 52 cartas
 * en una posición discreta válida del mazo (1 al 52).
 */
export function mapRatioToDeckPosition(ratio: number): number {
  const clamped = Math.min(1, Math.max(0, ratio));
  if (clamped <= 0) {
    return 1;
  }
  return Math.min(DECK_SIZE, Math.max(1, Math.ceil(clamped * DECK_SIZE)));
}

/**
 * Evalúa el resultado de cortar en `cutPosition` cuando se busca la carta en `targetPosition`.
 * - `direction === 'above'`: `cutPosition < targetPosition` (por arriba en el mazo, menos cartas).
 * - `direction === 'below'`: `cutPosition > targetPosition` (por abajo en el mazo, más cartas).
 */
export function evaluateCutAttempt(
  targetPosition: number,
  cutPosition: number,
): CutEvaluationResult {
  if (targetPosition < 1 || targetPosition > DECK_SIZE) {
    throw new Error(`Posición objetivo fuera de rango (1-52): ${targetPosition}`);
  }
  if (cutPosition < 1 || cutPosition > DECK_SIZE) {
    throw new Error(`Posición de corte fuera de rango (1-52): ${cutPosition}`);
  }

  const targetCard = SSP_STACK[targetPosition - 1];
  const cutCard = SSP_STACK[cutPosition - 1];
  const targetBreakdown = describeAbsolutePosition(targetCard);
  const cutBreakdown = describeAbsolutePosition(cutCard);
  const signedDelta = cutPosition - targetPosition;
  const distance = Math.abs(signedDelta);
  const isExact = signedDelta === 0;

  let direction: CutDeviationDirection | null = null;
  if (signedDelta < 0) {
    direction = 'above';
  } else if (signedDelta > 0) {
    direction = 'below';
  }

  return {
    targetCard,
    targetBreakdown,
    cutPosition,
    cutCard,
    cutBreakdown,
    isExact,
    signedDelta,
    distance,
    direction,
    withinPhysicalTolerance: distance <= PHYSICAL_TOLERANCE_CARDS,
  };
}

function buildCardClueWithoutAnswer(breakdown: AbsolutePositionBreakdown): string {
  return `${breakdown.card.fullName}: ${breakdown.kingdomDetail.character.singularName} → ${breakdown.kingdom.name} (${breakdown.offsetLabel}) e índice ${breakdown.card.rank} (${breakdown.internalRule.mnemonicTag})`;
}

const decimalFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

@Component({
  selector: 'app-riffle-cut-trainer',
  imports: [Icon, SuitIcon],
  templateUrl: './riffle-cut-trainer.html',
  styleUrl: './riffle-cut-trainer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiffleCutTrainer {
  private readonly destroyRef = inject(DestroyRef);
  private readonly barTrackRef = viewChild<ElementRef<HTMLElement>>('barTrack');

  protected readonly deckSize = DECK_SIZE;
  protected readonly deckSlots = DECK_SLOTS;
  protected readonly phases = CUT_TRAINING_PHASES;
  protected readonly quickDistances = QUICK_DEVIATION_DISTANCES;
  protected readonly toleranceLimit = PHYSICAL_TOLERANCE_CARDS;

  readonly activePhaseId = signal<CutTrainingPhaseId>('cut-26');
  readonly completedPhases = signal<readonly CutTrainingPhaseId[]>([]);

  readonly stage = signal<CutAttemptStage>('ready');
  readonly isDragging = signal<boolean>(false);
  readonly riffleSlot = signal<number>(0);
  readonly lastEvaluation = signal<CutEvaluationResult | null>(null);
  readonly feedback = signal<RiffleCutTrainerFeedback | null>(null);

  // Estado específico de fases 1..3 y del ciclo de 52 cartas (Fase 4)
  readonly phaseResolvedCount = signal<number>(0);
  readonly deck = signal<readonly SspCard[]>(shuffleSspDeck());
  readonly currentIndex = signal<number>(0);
  readonly isCycleCompleted = signal<boolean>(false);

  // Marcadores de rendimiento de la fase activa
  readonly totalCuts = signal<number>(0);
  readonly exactCuts = signal<number>(0);
  readonly toleranceCuts = signal<number>(0);
  readonly cumulativeDistance = signal<number>(0);
  readonly deviationHits = signal<number>(0);
  readonly cutMisses = signal<number>(0);
  readonly deviationMisses = signal<number>(0);
  readonly totalMisses = computed<number>(() => this.cutMisses() + this.deviationMisses());

  // Cronómetro para la Fase 4 (ciclo de 52 cartas)
  readonly elapsedMs = signal<number>(0);
  readonly isTimerRunning = signal<boolean>(false);

  private activePointerId: number | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private runStartedAtMs = 0;
  private accumulatedMs = 0;

  readonly selectedDirection = signal<CutDeviationDirection | null>(null);
  readonly selectedDistance = signal<number | null>(null);

  protected readonly isDeviationValid = computed<boolean>(() => {
    const dir = this.selectedDirection();
    const dist = this.selectedDistance();
    return (
      dir !== null &&
      dist !== null &&
      Number.isInteger(dist) &&
      dist >= 1 &&
      dist <= PHYSICAL_TOLERANCE_CARDS
    );
  });

  protected readonly activePhase = computed<CutPhaseMeta>(
    () => CUT_PHASE_BY_ID[this.activePhaseId()],
  );

  protected readonly isCycle52Phase = computed<boolean>(
    () => this.activePhaseId() === 'cycle-52',
  );

  protected readonly nextPhaseMeta = computed<CutPhaseMeta | null>(() => {
    const idx = CUT_TRAINING_PHASES.findIndex((p) => p.id === this.activePhaseId());
    if (idx < 0 || idx >= CUT_TRAINING_PHASES.length - 1) {
      return null;
    }
    return CUT_TRAINING_PHASES[idx + 1];
  });

  protected readonly isCurrentPhaseCompleted = computed<boolean>(() =>
    this.completedPhases().includes(this.activePhaseId()),
  );

  protected readonly targetCard = computed<SspCard>(() => {
    const fixedPos = this.activePhase().fixedTargetPosition;
    if (fixedPos !== null) {
      return SSP_STACK[fixedPos - 1];
    }
    return this.deck()[this.currentIndex()] ?? SSP_STACK[0];
  });

  protected readonly targetCardInkHex = computed<string>(() =>
    getCardDeckInkHex(this.targetCard().suit),
  );

  protected readonly cycleStepNumber = computed<number>(() =>
    this.isCycleCompleted() ? DECK_SIZE : this.currentIndex() + 1,
  );

  protected readonly phaseProgressPercent = computed<number>(() => {
    const goal = this.activePhase().goalCount;
    if (this.isCycle52Phase()) {
      return Math.round((this.phaseResolvedCount() / goal) * 100);
    }
    if (this.isCurrentPhaseCompleted()) {
      return 100;
    }
    return Math.min(100, Math.round((this.phaseResolvedCount() / goal) * 100));
  });

  protected readonly formattedTime = computed<string>(() =>
    formatStopwatchTime(this.elapsedMs()),
  );

  protected readonly averageDeviationLabel = computed<string | null>(() => {
    const cuts = this.totalCuts();
    if (cuts === 0) {
      return null;
    }
    return decimalFormatter.format(this.cumulativeDistance() / cuts);
  });

  protected readonly averageSecondsPerCard = computed<string>(() => {
    const seconds = this.elapsedMs() / 1000 / DECK_SIZE;
    return decimalFormatter.format(seconds);
  });

  protected readonly activeDisplaySlot = computed<number>(() => {
    const evalResult = this.lastEvaluation();
    if (this.stage() !== 'ready' && evalResult !== null) {
      return evalResult.cutPosition;
    }
    return this.riffleSlot();
  });

  protected readonly handleLeftCss = computed<string>(() => {
    const slot = this.activeDisplaySlot();
    if (slot <= 0) {
      return '-26px';
    }
    const percent = ((slot - 0.5) / DECK_SIZE) * 100;
    return `${percent}%`;
  });

  protected readonly targetMarkerLeftCss = computed<string>(() => {
    const targetPos = this.targetCard().position;
    const percent = ((targetPos - 0.5) / DECK_SIZE) * 100;
    return `${percent}%`;
  });

  protected readonly gapHighlightStyle = computed<{ left: string; width: string } | null>(() => {
    const evalResult = this.lastEvaluation();
    if (this.stage() !== 'resolved' || !evalResult || evalResult.isExact) {
      return null;
    }
    const minPos = Math.min(evalResult.cutPosition, evalResult.targetCard.position);
    const maxPos = Math.max(evalResult.cutPosition, evalResult.targetCard.position);
    const leftPct = ((minPos - 0.5) / DECK_SIZE) * 100;
    const rightPct = ((maxPos - 0.5) / DECK_SIZE) * 100;
    return {
      left: `${leftPct}%`,
      width: `${Math.max(1.5, rightPct - leftPct)}%`,
    };
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearTimerInterval();
    });
  }

  protected cardInkHex(suit: SuitCode): string {
    return getCardDeckInkHex(suit);
  }

  protected isPhaseDone(phaseId: CutTrainingPhaseId): boolean {
    return this.completedPhases().includes(phaseId);
  }

  protected isSlotLifted(slot: number): boolean {
    const active = this.activeDisplaySlot();
    return active >= 1 && slot <= active;
  }

  protected isSlotRiffling(slot: number): boolean {
    if (this.stage() !== 'ready') {
      return false;
    }
    const active = this.riffleSlot();
    return active >= 1 && Math.abs(slot - active) <= 2;
  }

  selectPhase(phaseId: CutTrainingPhaseId): void {
    if (this.activePhaseId() === phaseId && !this.isCycleCompleted()) {
      return;
    }
    this.clearTimerInterval();
    this.isTimerRunning.set(false);
    this.runStartedAtMs = 0;
    this.accumulatedMs = 0;
    this.elapsedMs.set(0);

    this.activePhaseId.set(phaseId);
    this.phaseResolvedCount.set(0);
    this.totalCuts.set(0);
    this.exactCuts.set(0);
    this.toleranceCuts.set(0);
    this.cumulativeDistance.set(0);
    this.deviationHits.set(0);
    this.cutMisses.set(0);
    this.deviationMisses.set(0);
    this.isCycleCompleted.set(false);

    if (phaseId === 'cycle-52') {
      this.deck.set(shuffleSspDeck());
      this.currentIndex.set(0);
    }

    this.resetCurrentAttemptState();
  }

  goToNextPhase(): void {
    const next = this.nextPhaseMeta();
    if (next) {
      this.selectPhase(next.id);
    }
  }

  resetCurrentPhase(): void {
    this.clearTimerInterval();
    this.isTimerRunning.set(false);
    this.runStartedAtMs = 0;
    this.accumulatedMs = 0;
    this.elapsedMs.set(0);

    this.phaseResolvedCount.set(0);
    this.totalCuts.set(0);
    this.exactCuts.set(0);
    this.toleranceCuts.set(0);
    this.cumulativeDistance.set(0);
    this.deviationHits.set(0);
    this.cutMisses.set(0);
    this.deviationMisses.set(0);
    this.isCycleCompleted.set(false);

    if (this.isCycle52Phase()) {
      this.deck.set(shuffleSspDeck());
      this.currentIndex.set(0);
    }

    this.resetCurrentAttemptState();
  }

  toggleTimer(): void {
    if (!this.isCycle52Phase() || this.isCycleCompleted()) {
      return;
    }
    if (this.isTimerRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(): void {
    if (!this.isCycle52Phase() || this.isTimerRunning() || this.isCycleCompleted()) {
      return;
    }
    this.runStartedAtMs = Date.now();
    this.isTimerRunning.set(true);
    this.clearTimerInterval();
    this.intervalId = setInterval(() => {
      this.elapsedMs.set(this.accumulatedMs + (Date.now() - this.runStartedAtMs));
    }, 200);
  }

  pauseTimer(): void {
    if (!this.isTimerRunning()) {
      return;
    }
    const now = Date.now();
    this.accumulatedMs += Math.max(0, now - this.runStartedAtMs);
    this.elapsedMs.set(this.accumulatedMs);
    this.isTimerRunning.set(false);
    this.clearTimerInterval();
  }

  onArenaPointerDown(event: PointerEvent): void {
    if (
      (this.stage() !== 'ready' && this.stage() !== 'out-of-tolerance') ||
      this.isCycleCompleted()
    ) {
      return;
    }
    if (this.stage() === 'out-of-tolerance') {
      this.resetCurrentAttemptState();
    }
    if (event.button !== 0 && event.pointerType === 'mouse') {
      return;
    }
    event.preventDefault();

    if (this.isCycle52Phase() && !this.isTimerRunning()) {
      this.startTimer();
    }

    const hostEl = event.currentTarget as HTMLElement | null;
    if (hostEl && typeof hostEl.setPointerCapture === 'function') {
      try {
        hostEl.setPointerCapture(event.pointerId);
      } catch {
        // Ignorar en entornos de prueba sintéticos sin pointer activo
      }
    }

    this.activePointerId = event.pointerId;
    this.isDragging.set(true);
    this.updateRiffleFromClientX(event.clientX);
  }

  onArenaPointerMove(event: PointerEvent): void {
    if (!this.isDragging() || this.activePointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    this.updateRiffleFromClientX(event.clientX);
  }

  onArenaPointerUp(event: PointerEvent): void {
    if (!this.isDragging() || this.activePointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    this.updateRiffleFromClientX(event.clientX);

    const hostEl = event.currentTarget as HTMLElement | null;
    if (hostEl && typeof hostEl.releasePointerCapture === 'function') {
      try {
        hostEl.releasePointerCapture(event.pointerId);
      } catch {
        // Ignorar en entornos de prueba sintéticos
      }
    }

    const droppedSlot = this.riffleSlot();
    this.isDragging.set(false);
    this.activePointerId = null;

    if (droppedSlot >= 1 && droppedSlot <= DECK_SIZE) {
      this.performCut(droppedSlot);
    } else {
      this.riffleSlot.set(0);
    }
  }

  onArenaPointerCancel(event: PointerEvent): void {
    if (!this.isDragging() || this.activePointerId !== event.pointerId) {
      return;
    }
    this.isDragging.set(false);
    this.activePointerId = null;
    this.riffleSlot.set(0);
  }

  onHandleKeydown(event: KeyboardEvent): void {
    if (
      (this.stage() !== 'ready' && this.stage() !== 'out-of-tolerance') ||
      this.isCycleCompleted()
    ) {
      return;
    }
    if (this.stage() === 'out-of-tolerance') {
      this.resetCurrentAttemptState();
    }

    const current = this.riffleSlot();

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.isCycle52Phase() && !this.isTimerRunning()) {
        this.startTimer();
      }
      const step = event.shiftKey ? 5 : 1;
      this.riffleSlot.set(Math.min(DECK_SIZE, Math.max(1, current + step)));
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = event.shiftKey ? 5 : 1;
      this.riffleSlot.set(Math.max(0, current - step));
      return;
    }

    if (event.key === 'PageDown') {
      event.preventDefault();
      if (this.isCycle52Phase() && !this.isTimerRunning()) {
        this.startTimer();
      }
      this.riffleSlot.set(Math.min(DECK_SIZE, Math.max(1, current + 5)));
      return;
    }

    if (event.key === 'PageUp') {
      event.preventDefault();
      this.riffleSlot.set(Math.max(0, current - 5));
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      this.riffleSlot.set(1);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.riffleSlot.set(DECK_SIZE);
      return;
    }

    if ((event.key === 'Enter' || event.key === ' ') && current >= 1) {
      event.preventDefault();
      this.performCut(current);
    }
  }

  performCut(cutPosition: number): void {
    if (
      (this.stage() !== 'ready' && this.stage() !== 'out-of-tolerance') ||
      this.isCycleCompleted()
    ) {
      return;
    }

    const clampedPos = Math.min(DECK_SIZE, Math.max(1, Math.round(cutPosition)));
    if (this.isCycle52Phase() && !this.isTimerRunning()) {
      this.startTimer();
    }

    const target = this.targetCard();
    const evaluation = evaluateCutAttempt(target.position, clampedPos);

    this.riffleSlot.set(clampedPos);
    this.lastEvaluation.set(evaluation);
    this.totalCuts.update((n) => n + 1);
    this.cumulativeDistance.update((sum) => sum + evaluation.distance);

    if (evaluation.withinPhysicalTolerance) {
      this.toleranceCuts.update((n) => n + 1);
    }

    if (evaluation.isExact) {
      this.exactCuts.update((n) => n + 1);
      this.completeAttemptResolution(evaluation, true);
      return;
    }

    if (!evaluation.withinPhysicalTolerance) {
      this.cutMisses.update((n) => n + 1);
      this.selectedDirection.set(null);
      this.selectedDistance.set(null);
      this.stage.set('out-of-tolerance');
      const dirWord = evaluation.direction === 'above' ? 'por arriba' : 'por abajo';
      this.feedback.set({
        kind: 'miss',
        heading: `Corte fuera de margen: te has desviado ${evaluation.distance} cartas ${dirWord}.`,
        detail: `Has cortado en ${evaluation.cutCard.fullName} (posición #${evaluation.cutPosition}). El margen máximo es de ±${PHYSICAL_TOLERANCE_CARDS} cartas. Vuelve a riflear para acercarte a la carta buscada.`,
      });
      return;
    }

    this.selectedDirection.set(null);
    this.selectedDistance.set(null);
    this.stage.set('awaiting-deviation');
    this.feedback.set(null);
  }

  retryRiffle(): void {
    if (this.isCycle52Phase() && !this.isCycleCompleted()) {
      this.startTimer();
    }
    this.resetCurrentAttemptState();
  }

  selectDirection(direction: CutDeviationDirection): void {
    if (this.stage() !== 'awaiting-deviation') {
      return;
    }
    this.selectedDirection.set(direction);
  }

  selectQuickDistance(distance: number): void {
    if (this.stage() !== 'awaiting-deviation') {
      return;
    }
    this.selectedDistance.set(distance);
  }

  onDeviationFormSubmit(event: Event): void {
    event.preventDefault();
    this.submitDeviation();
  }

  submitDeviation(): void {
    const evaluation = this.lastEvaluation();
    if (this.stage() !== 'awaiting-deviation' || !evaluation || evaluation.isExact) {
      return;
    }

    if (!this.isDeviationValid()) {
      return;
    }

    const chosenDirection = this.selectedDirection();
    const chosenDistance = this.selectedDistance();

    if (chosenDirection === null || chosenDistance === null) {
      return;
    }

    if (chosenDirection === evaluation.direction && chosenDistance === evaluation.distance) {
      this.deviationHits.update((n) => n + 1);
      this.completeAttemptResolution(evaluation, false);
      return;
    }

    this.deviationMisses.update((n) => n + 1);

    const directionMatches = chosenDirection === evaluation.direction;
    const distanceMatches = chosenDistance === evaluation.distance;
    const chosenDirText = chosenDirection === 'above' ? 'por arriba' : 'por abajo';

    let detailHint: string;
    if (distanceMatches && !directionMatches) {
      detailHint = `¡La diferencia de ${chosenDistance} ${chosenDistance === 1 ? 'carta' : 'cartas'} es exacta, pero el sentido es el contrario! Recuerda: hacia el #1 (menos cartas cortadas) es «por arriba» y hacia el #52 (más cartas cortadas) es «por abajo».`;
    } else if (directionMatches && !distanceMatches) {
      if (this.isCycle52Phase()) {
        detailHint = `Acertaste el sentido (${chosenDirText}), pero revisa la resta de posiciones. Pista → Cortada (${buildCardClueWithoutAnswer(evaluation.cutBreakdown)}) · Buscada (${buildCardClueWithoutAnswer(evaluation.targetBreakdown)}).`;
      } else {
        detailHint = `Acertaste el sentido (${chosenDirText}), pero revisa en qué posición está la carta cortada (${buildCardClueWithoutAnswer(evaluation.cutBreakdown)}) frente al objetivo #${evaluation.targetCard.position}.`;
      }
    } else if (this.isCycle52Phase()) {
      detailHint = `Calcula ambas posiciones y compáralas → Cortada (${buildCardClueWithoutAnswer(evaluation.cutBreakdown)}) · Buscada (${buildCardClueWithoutAnswer(evaluation.targetBreakdown)}).`;
    } else {
      detailHint = `Deduce dónde está la carta cortada (${buildCardClueWithoutAnswer(evaluation.cutBreakdown)}) y compárala con la posición #${evaluation.targetCard.position} (${evaluation.targetCard.fullName}).`;
    }

    this.feedback.set({
      kind: 'miss',
      heading: `No son ${chosenDistance} ${chosenDistance === 1 ? 'carta' : 'cartas'} ${chosenDirText}. Revisa el cálculo e inténtalo de nuevo.`,
      detail: detailHint,
    });
  }

  repeatCurrentTargetCut(): void {
    if (this.isCycle52Phase() && !this.isCycleCompleted()) {
      this.startTimer();
    }
    this.resetCurrentAttemptState();
  }

  advanceAfterResolved(): void {
    if (!this.isCycle52Phase()) {
      this.resetCurrentAttemptState();
      return;
    }

    if (this.currentIndex() < this.deck().length - 1) {
      this.currentIndex.update((idx) => idx + 1);
      this.resetCurrentAttemptState();
      this.startTimer();
    }
  }

  setDeckForTesting(cards: readonly SspCard[], initialElapsedMs = 0): void {
    this.clearTimerInterval();
    this.isTimerRunning.set(false);
    this.runStartedAtMs = 0;
    this.accumulatedMs = initialElapsedMs;
    this.elapsedMs.set(initialElapsedMs);
    this.activePhaseId.set('cycle-52');
    this.deck.set([...cards]);
    this.currentIndex.set(0);
    this.phaseResolvedCount.set(0);
    this.totalCuts.set(0);
    this.exactCuts.set(0);
    this.toleranceCuts.set(0);
    this.cumulativeDistance.set(0);
    this.deviationHits.set(0);
    this.cutMisses.set(0);
    this.deviationMisses.set(0);
    this.isCycleCompleted.set(false);
    this.resetCurrentAttemptState();
  }

  private completeAttemptResolution(evaluation: CutEvaluationResult, wasDirectExact: boolean): void {
    const nextResolvedCount = this.phaseResolvedCount() + 1;
    this.phaseResolvedCount.set(nextResolvedCount);

    const targetBreakdownText = `${evaluation.targetCard.fullName}: ${evaluation.targetBreakdown.internalRule.ordinalLabel} de ${evaluation.targetBreakdown.kingdom.displaySuitLabel} (${evaluation.targetBreakdown.sumFormulaText})`;

    if (!this.isCycle52Phase()) {
      const phaseId = this.activePhaseId();
      const goal = this.activePhase().goalCount;
      if (wasDirectExact || nextResolvedCount >= goal) {
        this.markPhaseCompleted(phaseId);
      }

      if (wasDirectExact) {
        this.feedback.set({
          kind: 'hit',
          heading: `¡Correcto! Clavaste exactamente la carta #${evaluation.targetCard.position} (${evaluation.targetCard.fullName}).`,
          detail: `Corte directo sin desvío · ${targetBreakdownText}.`,
        });
      } else {
        const dirWord = evaluation.direction === 'above' ? 'por arriba' : 'por abajo';
        const toleranceNote = evaluation.withinPhysicalTolerance
          ? ` · ¡Dentro del margen óptimo de ±${PHYSICAL_TOLERANCE_CARDS} cartas!`
          : '';
        this.feedback.set({
          kind: 'hit',
          heading: `¡Desvío exacto! Te habías ido ${evaluation.distance} ${evaluation.distance === 1 ? 'carta' : 'cartas'} ${dirWord} (cortaste en #${evaluation.cutPosition} · ${evaluation.cutCard.fullName}).`,
          detail: `Tu corte: #${evaluation.cutPosition} (${evaluation.cutBreakdown.sumFormulaText}) frente al objetivo #${evaluation.targetCard.position} (${evaluation.targetCard.fullName})${toleranceNote}.`,
        });
      }

      this.stage.set('resolved');
      return;
    }

    // Fase 4: Ciclo de 52 cartas aleatorias
    this.pauseTimer();
    const isLastCard = this.currentIndex() >= this.deck().length - 1;

    if (wasDirectExact) {
      this.feedback.set({
        kind: 'hit',
        heading: isLastCard
          ? `¡Ciclo de 52 cartas completado con corte exacto en ${evaluation.targetCard.fullName} (#${evaluation.targetCard.position})!`
          : `¡Correcto! Corte exacto en ${evaluation.targetCard.fullName} (posición #${evaluation.targetCard.position}).`,
        detail: targetBreakdownText,
      });
    } else {
      const dirWord = evaluation.direction === 'above' ? 'por arriba' : 'por abajo';
      const toleranceNote = evaluation.withinPhysicalTolerance
        ? ` · Dentro del margen de ±${PHYSICAL_TOLERANCE_CARDS} cartas.`
        : '.';
      this.feedback.set({
        kind: 'hit',
        heading: isLastCard
          ? `¡Ciclo de 52 cartas completado! Último desvío resuelto: ${evaluation.distance} ${evaluation.distance === 1 ? 'carta' : 'cartas'} ${dirWord}.`
          : `¡Cálculo correcto! Cortaste en #${evaluation.cutPosition} (${evaluation.cutCard.fullName}), ${evaluation.distance} ${evaluation.distance === 1 ? 'carta' : 'cartas'} ${dirWord} de #${evaluation.targetCard.position} (${evaluation.targetCard.fullName}).`,
        detail: `Cortada: ${evaluation.cutBreakdown.sumFormulaText} · Buscada: ${evaluation.targetBreakdown.sumFormulaText}${toleranceNote}`,
      });
    }

    if (isLastCard) {
      this.markPhaseCompleted('cycle-52');
      this.isCycleCompleted.set(true);
    }

    this.stage.set('resolved');
  }

  private markPhaseCompleted(phaseId: CutTrainingPhaseId): void {
    this.completedPhases.update((prev) => (prev.includes(phaseId) ? prev : [...prev, phaseId]));
  }

  private resetCurrentAttemptState(): void {
    this.stage.set('ready');
    this.isDragging.set(false);
    this.activePointerId = null;
    this.riffleSlot.set(0);
    this.lastEvaluation.set(null);
    this.feedback.set(null);
    this.selectedDirection.set(null);
    this.selectedDistance.set(null);
  }

  private updateRiffleFromClientX(clientX: number): void {
    const trackEl = this.barTrackRef()?.nativeElement;
    if (!trackEl) {
      return;
    }
    const rect = trackEl.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    if (clientX < rect.left - 6) {
      this.riffleSlot.set(0);
      return;
    }
    const ratio = (clientX - rect.left) / rect.width;
    this.riffleSlot.set(mapRatioToDeckPosition(ratio));
  }

  private clearTimerInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
