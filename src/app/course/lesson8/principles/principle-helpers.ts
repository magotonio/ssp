import {
  CardValue,
  DECK_SIZE,
  getNextSuit,
  SSP_STACK,
  SspCard,
  SUIT_BY_CODE,
  SuitCode,
} from '../../../ssp/ssp-stack';

export const SEVENTEEN_PILES = 17;

/** Devuelve la carta de una posición 1-based tratando la baraja como un bucle cerrado. */
export function cardAtPosition(position: number): SspCard {
  const index = (((position - 1) % DECK_SIZE) + DECK_SIZE) % DECK_SIZE;
  return SSP_STACK[index];
}

/** Valor numérico del palo (P=1, C=2, T=3, D=4). */
export function suitNumber(suit: SuitCode): number {
  return SUIT_BY_CODE[suit].order;
}

/** Color físico del palo en una baraja convencional. */
export function suitColor(suit: SuitCode): 'black' | 'red' {
  return suit === 'C' || suit === 'D' ? 'red' : 'black';
}

/** Palo resultante de avanzar `steps` palos en el ciclo canónico P → C → T → D. */
export function advanceSuit(suit: SuitCode, steps: 1 | 2): SuitCode {
  return getNextSuit(suit, steps);
}

/** Posición interna (1–13) de un índice: su valor por 3 en módulo 13 (0 se lee como 13). */
export function internalPositionByTimesThree(value: CardValue): number {
  return ((value * 3 - 1) % 13) + 1;
}

/** Paridad de la suma índice + valor del palo. */
export function parityOfIndexPlusSuit(card: SspCard): 'par' | 'impar' {
  return (card.value + suitNumber(card.suit)) % 2 === 0 ? 'par' : 'impar';
}

/** Posición de la carta del mismo palo con el índice inmediatamente superior (de As a Rey). */
export function nextValueSameSuitPosition(card: SspCard): number | null {
  if (card.value === 13) {
    return null;
  }
  const target = SSP_STACK.find((c) => c.suit === card.suit && c.value === card.value + 1);
  return target?.position ?? null;
}

/** Distancia cíclica hacia delante entre dos posiciones de la baraja. */
export function forwardDistance(from: number, to: number): number {
  return (((to - from) % DECK_SIZE) + DECK_SIZE) % DECK_SIZE;
}

export interface SeventeenPilesResult {
  /** Orden en que se reparten las cartas (por palos, de Rey a As: P, C, T, D). */
  readonly dealingOrder: readonly SspCard[];
  /** Contenido de cada montón en el orden de reparto (la última repartida queda arriba). */
  readonly piles: readonly (readonly SspCard[])[];
  /** Baraja resultante tras recoger los montones del 17 al 1, leyendo cada uno en orden de reparto. */
  readonly gathered: readonly SspCard[];
}

/** Simula la construcción rápida repartiendo la baraja por palos en 17 montones. */
export function buildSeventeenPiles(): SeventeenPilesResult {
  const suits: readonly SuitCode[] = ['P', 'C', 'T', 'D'];
  const dealingOrder: SspCard[] = suits.flatMap((suit) =>
    SSP_STACK.filter((card) => card.suit === suit).sort((a, b) => b.value - a.value),
  );

  const piles: SspCard[][] = Array.from({ length: SEVENTEEN_PILES }, () => []);
  dealingOrder.forEach((card, index) => piles[index % SEVENTEEN_PILES].push(card));

  const gathered = [...piles].reverse().flat();
  return { dealingOrder, piles, gathered };
}

