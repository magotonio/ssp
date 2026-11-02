export type SuitCode = 'P' | 'C' | 'T' | 'D';

export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface SuitMeta {
  readonly code: SuitCode;
  readonly order: 1 | 2 | 3 | 4;
  readonly pluralName: string;
  readonly singularName: string;
  readonly colorName: string;
  readonly dotColor: string;
  readonly surfaceBg: string;
  readonly surfaceBorder: string;
  readonly textColor: string;
}

export interface SspCard {
  readonly position: number;
  readonly value: CardValue;
  readonly rank: string;
  readonly valueName: string;
  readonly suit: SuitCode;
  readonly code: string;
  readonly fullName: string;
}

export interface CircleConstructionStep {
  readonly stepNumber: number;
  readonly slotIndex: number;
  readonly fromSlotIndex: number | null;
  readonly skippedSlotIndices: readonly number[];
  readonly isSuitTransition: boolean;
  readonly ruleDescription: string;
  readonly card: SspCard;
}

export const SUITS: readonly SuitMeta[] = [
  {
    code: 'P',
    order: 1,
    pluralName: 'Picas',
    singularName: 'Pica',
    colorName: 'Negro',
    dotColor: '#18181b',
    surfaceBg: '#f1f5f9',
    surfaceBorder: '#cbd5e1',
    textColor: '#0f172a',
  },
  {
    code: 'C',
    order: 2,
    pluralName: 'Corazones',
    singularName: 'Corazón',
    colorName: 'Rojo',
    dotColor: '#e11d48',
    surfaceBg: '#fff1f2',
    surfaceBorder: '#fecdd3',
    textColor: '#9f1239',
  },
  {
    code: 'T',
    order: 3,
    pluralName: 'Tréboles',
    singularName: 'Trébol',
    colorName: 'Verde',
    dotColor: '#16a34a',
    surfaceBg: '#f0fdf4',
    surfaceBorder: '#bbf7d0',
    textColor: '#166534',
  },
  {
    code: 'D',
    order: 4,
    pluralName: 'Diamantes',
    singularName: 'Diamante',
    colorName: 'Azul',
    dotColor: '#2563eb',
    surfaceBg: '#eff6ff',
    surfaceBorder: '#bfdbfe',
    textColor: '#1d4ed8',
  },
] as const;

export const SUIT_BY_CODE: Readonly<Record<SuitCode, SuitMeta>> = {
  P: SUITS[0],
  C: SUITS[1],
  T: SUITS[2],
  D: SUITS[3],
};

const SUIT_BY_ORDER: Readonly<Record<number, SuitCode>> = {
  1: 'P',
  2: 'C',
  3: 'T',
  4: 'D',
};

const RANK_BY_VALUE: Readonly<Record<CardValue, string>> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

const VALUE_NAME_BY_VALUE: Readonly<Record<CardValue, string>> = {
  1: 'As',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'Jota',
  12: 'Reina',
  13: 'Rey',
};

export const DECK_SIZE = 52;

/**
 * Genera las 52 cartas según la definición normativa de ordenacion-ssp.md:
 * - Carta inicial C_1 = 9P (valor 9, palo 1)
 * - Si V_n >= 5: V_{n+1} = V_n - 4 y avanza 1 palo
 * - Si V_n <= 4: V_{n+1} = V_n + 9 y avanza 2 palos
 */
export function generateSspStack(): readonly SspCard[] {
  const cards: SspCard[] = [];
  let currentValue: CardValue = 9;
  let currentSuitOrder = 1;

  for (let position = 1; position <= DECK_SIZE; position++) {
    const suit = SUIT_BY_ORDER[currentSuitOrder];
    const suitMeta = SUIT_BY_CODE[suit];
    const rank = RANK_BY_VALUE[currentValue];
    const valueName = VALUE_NAME_BY_VALUE[currentValue];

    cards.push({
      position,
      value: currentValue,
      rank,
      valueName,
      suit,
      code: `${rank}${suit}`,
      fullName: `${valueName} de ${suitMeta.pluralName}`,
    });

    if (currentValue >= 5) {
      currentValue = (currentValue - 4) as CardValue;
      currentSuitOrder = (currentSuitOrder % 4) + 1;
    } else {
      currentValue = (currentValue + 9) as CardValue;
      currentSuitOrder = ((currentSuitOrder + 1) % 4) + 1;
    }
  }

  return cards;
}

export const SSP_STACK: readonly SspCard[] = generateSspStack();

const CARD_BY_CODE: ReadonlyMap<string, SspCard> = new Map(
  SSP_STACK.map((card) => [card.code, card]),
);

/**
 * Construye los 52 pasos del reloj visual de la Lección 1:
 * - El As de Picas (AP) se coloca arriba a las 12 en punto (hueco 0).
 * - Cada palo avanza contando de 3 en 3 huecos en sentido horario.
 * - El As del siguiente palo se coloca justo después del 5 del palo anterior.
 */
export function buildCircleConstructionSteps(): readonly CircleConstructionStep[] {
  const steps: CircleConstructionStep[] = [];
  const slotByCode = new Map<string, number>();
  const suitSequence: readonly SuitCode[] = ['P', 'C', 'T', 'D'];

  let stepNumber = 1;

  for (let sIdx = 0; sIdx < suitSequence.length; sIdx++) {
    const suit = suitSequence[sIdx];
    const previousSuit = sIdx > 0 ? suitSequence[sIdx - 1] : null;

    let currentSlot = 0;
    let fromSlotIndex: number | null = null;

    if (previousSuit !== null) {
      const fiveCode = `5${previousSuit}`;
      const fiveSlot = slotByCode.get(fiveCode);
      if (fiveSlot === undefined) {
        throw new Error(`No se encontró el hueco de referencia para ${fiveCode}`);
      }
      fromSlotIndex = fiveSlot;
      currentSlot = (fiveSlot + 1) % DECK_SIZE;
    }

    for (let val = 1; val <= 13; val++) {
      const value = val as CardValue;
      const code = `${RANK_BY_VALUE[value]}${suit}`;
      const card = CARD_BY_CODE.get(code);
      if (!card) {
        throw new Error(`Carta no encontrada en la ordenación SSP: ${code}`);
      }

      let ruleDescription: string;
      let skippedSlotIndices: readonly number[] = [];
      const isSuitTransition = value === 1 && previousSuit !== null;

      if (value === 1 && previousSuit === null) {
        ruleDescription = 'Hueco inicial arriba (las 12 en punto)';
      } else if (isSuitTransition && previousSuit !== null) {
        const prevSuitName = SUIT_BY_CODE[previousSuit].pluralName;
        ruleDescription = `Justo en el hueco siguiente al 5 de ${prevSuitName}`;
      } else {
        const prevValue = (value - 1) as CardValue;
        const prevCode = `${RANK_BY_VALUE[prevValue]}${suit}`;
        const prevCard = CARD_BY_CODE.get(prevCode);
        const prevSlot = slotByCode.get(prevCode) ?? 0;
        fromSlotIndex = prevSlot;
        currentSlot = (prevSlot + 3) % DECK_SIZE;
        skippedSlotIndices = [(prevSlot + 1) % DECK_SIZE, (prevSlot + 2) % DECK_SIZE];
        ruleDescription = `Contando 3 huecos desde el ${prevCard?.fullName ?? prevCode}`;
      }

      slotByCode.set(code, currentSlot);
      steps.push({
        stepNumber,
        slotIndex: currentSlot,
        fromSlotIndex,
        skippedSlotIndices,
        isSuitTransition,
        ruleDescription,
        card,
      });
      stepNumber++;
    }
  }

  return steps;
}

export const CIRCLE_CONSTRUCTION_STEPS: readonly CircleConstructionStep[] =
  buildCircleConstructionSteps();

export const START_CARD_SLOT_INDEX =
  CIRCLE_CONSTRUCTION_STEPS.find((step) => step.card.code === '9P')?.slotIndex ?? 24;

export const END_CARD_SLOT_INDEX =
  CIRCLE_CONSTRUCTION_STEPS.find((step) => step.card.code === 'KD')?.slotIndex ?? 23;

