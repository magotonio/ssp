import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { Icon } from '../../icon';
import {
  CIRCLE_CONSTRUCTION_STEPS,
  CircleConstructionStep,
  DECK_SIZE,
  END_CARD_SLOT_INDEX,
  SSP_STACK,
  START_CARD_SLOT_INDEX,
  SUIT_BY_CODE,
  SUITS,
  SuitCode,
  SuitMeta,
} from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

interface CircleSlotView {
  readonly slotIndex: number;
  readonly x: number;
  readonly y: number;
  readonly hitX1: number;
  readonly hitY1: number;
  readonly hitX2: number;
  readonly hitY2: number;
  readonly placedStep: CircleConstructionStep | null;
  readonly suitMeta: SuitMeta | null;
  readonly isSelected: boolean;
  readonly isLatestPlaced: boolean;
  readonly isSkippedInLatestStep: boolean;
  readonly isStartSspCard: boolean;
  readonly isEndSspCard: boolean;
  readonly ariaLabel: string;
}

interface SpeedOption {
  readonly id: AnimationSpeed;
  readonly label: string;
  readonly intervalMs: number;
}

const SVG_CENTER_X = 220;
const SVG_CENTER_Y = 224;
const RING_RADIUS = 166;
const HIT_INNER_RADIUS = 148;
const HIT_OUTER_RADIUS = 186;
const ARC_RADIUS = 152;

const SPEED_OPTIONS: readonly SpeedOption[] = [
  { id: 'slow', label: 'Pausada', intervalMs: 850 },
  { id: 'normal', label: 'Normal', intervalMs: 420 },
  { id: 'fast', label: 'Rápida', intervalMs: 150 },
] as const;

function polarPoint(slotIndex: number, radius: number): { readonly x: number; readonly y: number } {
  const angle = -Math.PI / 2 + (slotIndex * 2 * Math.PI) / DECK_SIZE;
  return {
    x: Number((SVG_CENTER_X + radius * Math.cos(angle)).toFixed(2)),
    y: Number((SVG_CENTER_Y + radius * Math.sin(angle)).toFixed(2)),
  };
}

@Component({
  selector: 'app-ssp-circle',
  imports: [Icon, SuitIcon],
  templateUrl: './ssp-circle.html',
  styleUrl: './ssp-circle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SspCircle {
  private readonly destroyRef = inject(DestroyRef);
  private readonly slotElements = viewChildren<ElementRef<SVGGElement>>('slotNode');

  private timerId: ReturnType<typeof setInterval> | null = null;

  protected readonly suits = SUITS;
  protected readonly suitByCode = SUIT_BY_CODE;
  protected readonly speedOptions = SPEED_OPTIONS;
  protected readonly deckSize = DECK_SIZE;
  protected readonly startCardSlot = START_CARD_SLOT_INDEX;
  protected readonly endCardSlot = END_CARD_SLOT_INDEX;

  readonly currentStep = signal<number>(0);
  readonly isPlaying = signal<boolean>(false);
  readonly speed = signal<AnimationSpeed>('normal');
  readonly selectedSlot = signal<number | null>(null);
  readonly focusedSlot = signal<number>(0);

  protected readonly placedBySlot = computed<ReadonlyMap<number, CircleConstructionStep>>(() => {
    const count = this.currentStep();
    const map = new Map<number, CircleConstructionStep>();
    for (let i = 0; i < count; i++) {
      const step = CIRCLE_CONSTRUCTION_STEPS[i];
      map.set(step.slotIndex, step);
    }
    return map;
  });

  protected readonly latestStep = computed<CircleConstructionStep | null>(() => {
    const count = this.currentStep();
    if (count <= 0) {
      return null;
    }
    return CIRCLE_CONSTRUCTION_STEPS[count - 1] ?? null;
  });

  protected readonly activeSlotIndex = computed<number | null>(() => {
    const manual = this.selectedSlot();
    if (manual !== null) {
      return manual;
    }
    const count = this.currentStep();
    if (count === DECK_SIZE) {
      return START_CARD_SLOT_INDEX;
    }
    return this.latestStep()?.slotIndex ?? null;
  });

  protected readonly inspectedStep = computed<CircleConstructionStep | null>(() => {
    const slot = this.activeSlotIndex();
    if (slot === null) {
      return null;
    }
    return this.placedBySlot().get(slot) ?? null;
  });

  protected readonly inspectedSuit = computed<SuitMeta | null>(() => {
    const step = this.inspectedStep();
    return step ? SUIT_BY_CODE[step.card.suit] : null;
  });

  protected readonly isStartCardPlaced = computed<boolean>(() =>
    this.placedBySlot().has(START_CARD_SLOT_INDEX),
  );

  protected readonly isEndCardPlaced = computed<boolean>(() =>
    this.placedBySlot().has(END_CARD_SLOT_INDEX),
  );

  readonly activeStage = computed<'idle' | SuitCode | 'complete'>(() => {
    const step = this.currentStep();
    if (step === 0) {
      return 'idle';
    }
    if (step === DECK_SIZE) {
      return 'complete';
    }
    if (step <= 13) {
      return 'P';
    }
    if (step <= 26) {
      return 'C';
    }
    if (step <= 39) {
      return 'T';
    }
    return 'D';
  });

  protected readonly stageMessage = computed<{ readonly title: string; readonly detail: string }>(() => {
    const manualSlot = this.selectedSlot();
    if (manualSlot !== null) {
      const inspected = this.placedBySlot().get(manualSlot);
      if (inspected) {
        const suit = SUIT_BY_CODE[inspected.card.suit];
        return {
          title: `${inspected.card.fullName} (${inspected.card.code}) · Posición ${inspected.card.position} en SSP`,
          detail: `${inspected.ruleDescription}. Punto de color ${suit.colorName.toLowerCase()} en el hueco ${manualSlot + 1} del reloj.`,
        };
      }
      return {
        title: `Hueco ${manualSlot + 1} del reloj · Sin carta todavía`,
        detail: `En este momento se han repartido ${this.currentStep()} de ${DECK_SIZE} cartas. Avanza la animación para completar el círculo.`,
      };
    }

    const stage = this.activeStage();
    const latest = this.latestStep();
    switch (stage) {
      case 'idle':
        return {
          title: '52 huecos dispuestos como un reloj',
          detail:
            'Pulsa «Reproducir» o «+1 carta» para colocar el As de Picas arriba (a las 12) y ver cómo se distribuyen los 4 palos contando de 3 en 3.',
        };
      case 'P':
        return {
          title: `Fase 1 · Repartiendo Picas (${this.suitPlacedCount('P')}/13)`,
          detail: latest
            ? `${latest.card.fullName}: ${latest.ruleDescription}.`
            : 'Se empieza en las 12 en punto y se avanza de 3 en 3 huecos.',
        };
      case 'C':
        return {
          title: `Fase 2 · Repartiendo Corazones (${this.suitPlacedCount('C')}/13)`,
          detail: latest
            ? `${latest.card.fullName}: ${latest.ruleDescription}.`
            : 'El As de Corazones se sitúa justo después del 5 de Picas.',
        };
      case 'T':
        return {
          title: `Fase 3 · Repartiendo Tréboles (${this.suitPlacedCount('T')}/13)`,
          detail: latest
            ? `${latest.card.fullName}: ${latest.ruleDescription}.`
            : 'El As de Tréboles se sitúa justo después del 5 de Corazones.',
        };
      case 'D':
        return {
          title: `Fase 4 · Repartiendo Diamantes (${this.suitPlacedCount('D')}/13)`,
          detail: latest
            ? `${latest.card.fullName}: ${latest.ruleDescription}.`
            : 'El As de Diamantes se sitúa justo después del 5 de Tréboles.',
        };
      case 'complete':
        return {
          title: '¡Círculo completo! Las 52 cartas encajan sin solaparse',
          detail:
            'Fijando el 9 de Picas como posición 1 y leyendo en sentido horario, se recorre toda la ordenación SSP hasta el Rey de Diamantes (posición 52). Toca cualquier punto para ver su carta.',
        };
    }
  });

  protected readonly jumpArcPath = computed<string | null>(() => {
    if (this.selectedSlot() !== null || this.currentStep() === DECK_SIZE) {
      return null;
    }
    const latest = this.latestStep();
    if (!latest || latest.fromSlotIndex === null) {
      return null;
    }
    const from = polarPoint(latest.fromSlotIndex, ARC_RADIUS);
    const to = polarPoint(latest.slotIndex, ARC_RADIUS);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const ctrlX = Number((midX + (SVG_CENTER_X - midX) * 0.34).toFixed(2));
    const ctrlY = Number((midY + (SVG_CENTER_Y - midY) * 0.34).toFixed(2));
    return `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;
  });

  protected readonly slots = computed<readonly CircleSlotView[]>(() => {
    const placedMap = this.placedBySlot();
    const activeSlot = this.activeSlotIndex();
    const latest = this.latestStep();
    const showJumpHints = this.selectedSlot() === null && this.currentStep() < DECK_SIZE;

    const views: CircleSlotView[] = [];
    for (let slotIndex = 0; slotIndex < DECK_SIZE; slotIndex++) {
      const center = polarPoint(slotIndex, RING_RADIUS);
      const hitInner = polarPoint(slotIndex, HIT_INNER_RADIUS);
      const hitOuter = polarPoint(slotIndex, HIT_OUTER_RADIUS);
      const placedStep = placedMap.get(slotIndex) ?? null;
      const suitMeta = placedStep ? SUIT_BY_CODE[placedStep.card.suit] : null;
      const isSelected = activeSlot === slotIndex;
      const isLatestPlaced = showJumpHints && latest?.slotIndex === slotIndex;
      const isSkippedInLatestStep =
        showJumpHints && (latest?.skippedSlotIndices.includes(slotIndex) ?? false);
      const isStartSspCard = placedStep?.card.code === '9P';
      const isEndSspCard = placedStep?.card.code === 'KD';

      const ariaLabel = placedStep
        ? `Hueco ${slotIndex + 1} del reloj: ${placedStep.card.fullName} (${placedStep.card.code}), color ${suitMeta?.colorName.toLowerCase()}, posición ${placedStep.card.position} en la ordenación SSP`
        : `Hueco ${slotIndex + 1} del reloj: vacío`;

      views.push({
        slotIndex,
        x: center.x,
        y: center.y,
        hitX1: hitInner.x,
        hitY1: hitInner.y,
        hitX2: hitOuter.x,
        hitY2: hitOuter.y,
        placedStep,
        suitMeta,
        isSelected,
        isLatestPlaced,
        isSkippedInLatestStep,
        isStartSspCard,
        isEndSspCard,
        ariaLabel,
      });
    }
    return views;
  });

  protected readonly startSlotCoords = polarPoint(START_CARD_SLOT_INDEX, RING_RADIUS);
  protected readonly endSlotCoords = polarPoint(END_CARD_SLOT_INDEX, RING_RADIUS);

  constructor() {
    this.destroyRef.onDestroy(() => this.stopPlayback());
  }

  suitPlacedCount(suit: SuitCode): number {
    const step = this.currentStep();
    const suitOrder = SUIT_BY_CODE[suit].order;
    const minStep = (suitOrder - 1) * 13;
    return Math.max(0, Math.min(13, step - minStep));
  }

  togglePlayback(): void {
    if (this.isPlaying()) {
      this.stopPlayback();
      return;
    }

    if (this.currentStep() >= DECK_SIZE) {
      this.currentStep.set(0);
    }

    this.selectedSlot.set(null);
    this.startPlayback();
  }

  stepForward(): void {
    this.stopPlayback();
    this.selectedSlot.set(null);
    const next = Math.min(DECK_SIZE, this.currentStep() + 1);
    this.currentStep.set(next);
    const placed = CIRCLE_CONSTRUCTION_STEPS[next - 1];
    if (placed) {
      this.focusedSlot.set(placed.slotIndex);
    }
  }

  stepBackward(): void {
    this.stopPlayback();
    this.selectedSlot.set(null);
    const prev = Math.max(0, this.currentStep() - 1);
    this.currentStep.set(prev);
    const placed = prev > 0 ? CIRCLE_CONSTRUCTION_STEPS[prev - 1] : null;
    this.focusedSlot.set(placed ? placed.slotIndex : 0);
  }

  resetCircle(): void {
    this.stopPlayback();
    this.selectedSlot.set(null);
    this.currentStep.set(0);
    this.focusedSlot.set(0);
  }

  fillAllCards(): void {
    this.stopPlayback();
    this.currentStep.set(DECK_SIZE);
    this.selectedSlot.set(START_CARD_SLOT_INDEX);
    this.focusedSlot.set(START_CARD_SLOT_INDEX);
  }

  jumpToSuitStage(suit: SuitCode): void {
    this.stopPlayback();
    const targetStep = SUIT_BY_CODE[suit].order * 13;
    this.currentStep.set(targetStep);
    if (targetStep === DECK_SIZE) {
      this.selectedSlot.set(START_CARD_SLOT_INDEX);
      this.focusedSlot.set(START_CARD_SLOT_INDEX);
    } else {
      const firstOfSuit = CIRCLE_CONSTRUCTION_STEPS[targetStep - 13];
      this.selectedSlot.set(firstOfSuit.slotIndex);
      this.focusedSlot.set(firstOfSuit.slotIndex);
    }
  }

  inspectSspBoundary(boundary: 'start' | 'end'): void {
    this.stopPlayback();
    if (this.currentStep() < DECK_SIZE) {
      this.currentStep.set(DECK_SIZE);
    }
    const targetSlot = boundary === 'start' ? START_CARD_SLOT_INDEX : END_CARD_SLOT_INDEX;
    this.selectedSlot.set(targetSlot);
    this.focusedSlot.set(targetSlot);
  }

  selectSlot(slotIndex: number): void {
    this.stopPlayback();
    this.selectedSlot.set(slotIndex);
    this.focusedSlot.set(slotIndex);
  }

  inspectNeighborSlot(delta: -1 | 1): void {
    this.stopPlayback();
    const base = this.activeSlotIndex() ?? 0;
    const nextSlot = (base + delta + DECK_SIZE) % DECK_SIZE;
    this.selectedSlot.set(nextSlot);
    this.focusedSlot.set(nextSlot);
  }

  setSpeed(newSpeed: AnimationSpeed): void {
    this.speed.set(newSpeed);
    if (this.isPlaying()) {
      this.stopPlayback();
      this.startPlayback();
    }
  }

  onSlotKeydown(event: KeyboardEvent, slotIndex: number): void {
    let nextSlot: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextSlot = (slotIndex + 1) % DECK_SIZE;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextSlot = (slotIndex - 1 + DECK_SIZE) % DECK_SIZE;
        break;
      case 'Home':
        nextSlot = 0;
        break;
      case 'End':
        nextSlot = DECK_SIZE - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectSlot(slotIndex);
        return;
      default:
        return;
    }

    event.preventDefault();
    this.selectSlot(nextSlot);
    const targetRef = this.slotElements()[nextSlot];
    targetRef?.nativeElement.focus();
  }

  protected get nextCardInSsp(): string | null {
    const step = this.inspectedStep();
    if (!step) {
      return null;
    }
    const nextIndex = step.card.position % DECK_SIZE;
    return SSP_STACK[nextIndex]?.code ?? null;
  }

  private startPlayback(): void {
    this.isPlaying.set(true);
    const intervalMs =
      SPEED_OPTIONS.find((opt) => opt.id === this.speed())?.intervalMs ?? 420;

    // Si estaba en 0, coloca inmediatamente la primera carta para dar respuesta visual al instante
    if (this.currentStep() === 0) {
      this.currentStep.set(1);
    }

    this.timerId = setInterval(() => {
      const next = this.currentStep() + 1;
      if (next >= DECK_SIZE) {
        this.currentStep.set(DECK_SIZE);
        this.stopPlayback();
        return;
      }
      this.currentStep.set(next);
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
