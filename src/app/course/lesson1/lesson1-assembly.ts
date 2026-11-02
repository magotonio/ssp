import {
  CardValue,
  DECK_SIZE,
  SSP_STACK,
  SspCard,
  SUIT_BY_CODE,
  SuitCode,
  SuitMeta,
} from '../../ssp/ssp-stack';

export type PickupBeat = 1 | 2 | 3;

export type BeatWord = 'UNO' | 'DOS' | 'TRES';

export interface PreparationPacket {
  readonly orderFromBottom: 1 | 2 | 3 | 4;
  readonly stackLayerLabel: string;
  readonly suit: SuitCode;
  readonly suitDisplayName: string;
  readonly suitMeta: SuitMeta;
  readonly bottomCard: SspCard;
  readonly topCard: SspCard;
  readonly instruction: string;
  readonly cardsTopToBottom: readonly SspCard[];
}

export interface AssemblyPile {
  readonly separationOrder: 1 | 2 | 3;
  readonly pickupBeat: PickupBeat;
  readonly beatWord: BeatWord;
  readonly tablePositionLabel: string;
  readonly topVisibleCard: SspCard;
  readonly bottomCard: SspCard;
  readonly cardCount: number;
  readonly cutLandmarkHint: string;
  readonly cardsTopToBottom: readonly SspCard[];
}

export interface PickupStep {
  readonly stepNumber: number;
  readonly roundNumber: number;
  readonly pickupBeat: PickupBeat;
  readonly beatWord: BeatWord;
  readonly tablePositionShort: 'Izquierda' | 'Centro' | 'Derecha';
  readonly card: SspCard;
}

const CARD_BY_SUIT_AND_VALUE: ReadonlyMap<string, SspCard> = new Map(
  SSP_STACK.map((card) => [`${card.suit}:${card.value}`, card]),
);

const CARD_BY_CODE: ReadonlyMap<string, SspCard> = new Map(
  SSP_STACK.map((card) => [card.code, card]),
);

export function getSspCardBySuitAndValue(suit: SuitCode, value: CardValue): SspCard {
  const found = CARD_BY_SUIT_AND_VALUE.get(`${suit}:${value}`);
  if (!found) {
    throw new Error(`Carta no encontrada para palo ${suit} y valor ${value}`);
  }
  return found;
}

export function getSspCardByCode(code: string): SspCard {
  const found = CARD_BY_CODE.get(code);
  if (!found) {
    throw new Error(`Carta no encontrada para código ${code}`);
  }
  return found;
}

function buildSuitFaceUpTopToBottom(suit: SuitCode): readonly SspCard[] {
  const cards: SspCard[] = [];
  for (let v = 1; v <= 13; v++) {
    cards.push(getSspCardBySuitAndValue(suit, v as CardValue));
  }
  return cards;
}

/**
 * Paquetes de preparación cara arriba según leccion1.md:
 * En cada palo, el Rey queda en el fondo y el As visible arriba (K -> Q -> ... -> A).
 * Orden desde el fondo del mazo hacia arriba: Picas -> Corazones -> Tréboles -> Diamantes (rombos).
 * Se exportan de arriba abajo para representarlos visualmente tal como se apilan frente al usuario,
 * manteniendo orderFromBottom (1 = Picas en el fondo, 4 = Diamantes en la parte superior).
 */
export const PREPARATION_PACKETS_TOP_TO_BOTTOM: readonly PreparationPacket[] = [
  {
    orderFromBottom: 4,
    stackLayerLabel: 'Parte superior (4º paquete · Arriba del todo)',
    suit: 'D',
    suitDisplayName: 'Diamantes (rombos)',
    suitMeta: SUIT_BY_CODE.D,
    bottomCard: getSspCardBySuitAndValue('D', 13),
    topCard: getSspCardBySuitAndValue('D', 1),
    instruction:
      'Colócalo cara arriba encima de los tréboles: Rey de Diamantes abajo y As de Diamantes visible arriba.',
    cardsTopToBottom: buildSuitFaceUpTopToBottom('D'),
  },
  {
    orderFromBottom: 3,
    stackLayerLabel: '3er paquete · Encima de los corazones',
    suit: 'T',
    suitDisplayName: 'Tréboles',
    suitMeta: SUIT_BY_CODE.T,
    bottomCard: getSspCardBySuitAndValue('T', 13),
    topCard: getSspCardBySuitAndValue('T', 1),
    instruction:
      'Colócalo cara arriba encima de los corazones: Rey de Tréboles sobre el As de Corazones y As de Tréboles arriba.',
    cardsTopToBottom: buildSuitFaceUpTopToBottom('T'),
  },
  {
    orderFromBottom: 2,
    stackLayerLabel: '2º paquete · Encima de las picas',
    suit: 'C',
    suitDisplayName: 'Corazones',
    suitMeta: SUIT_BY_CODE.C,
    bottomCard: getSspCardBySuitAndValue('C', 13),
    topCard: getSspCardBySuitAndValue('C', 1),
    instruction:
      'Colócalo cara arriba encima de las picas: Rey de Corazones sobre el As de Picas y As de Corazones arriba.',
    cardsTopToBottom: buildSuitFaceUpTopToBottom('C'),
  },
  {
    orderFromBottom: 1,
    stackLayerLabel: 'Fondo del mazo (1er paquete · Base)',
    suit: 'P',
    suitDisplayName: 'Picas',
    suitMeta: SUIT_BY_CODE.P,
    bottomCard: getSspCardBySuitAndValue('P', 13),
    topCard: getSspCardBySuitAndValue('P', 1),
    instruction:
      'Empieza por este palo cara arriba en tu mano: Rey de Picas abajo del todo (en la palma) hasta llegar al As de Picas arriba.',
    cardsTopToBottom: buildSuitFaceUpTopToBottom('P'),
  },
] as const;

export const PREPARED_FACE_UP_DECK_TOP_TO_BOTTOM: readonly SspCard[] =
  PREPARATION_PACKETS_TOP_TO_BOTTOM.flatMap((packet) => packet.cardsTopToBottom);

/**
 * Los 3 montones sobre la mesa tras dividir el mazo preparado cara arriba:
 * 1º separado: As de rombos/diamantes arriba (17 cartas: AD..KD, AT..4T) -> Derecha (tiempo «TRES»)
 * 2º separado: 5 de tréboles arriba (17 cartas: 5T..KT, AC..8C) -> Centro (tiempo «DOS»)
 * 3º restante: 9 de corazones arriba (18 cartas: 9C..KC, AP..KP) -> Izquierda (tiempo «UNO»)
 */
export function buildAssemblyPilesBySeparationOrder(): readonly AssemblyPile[] {
  const pile1Cards = PREPARED_FACE_UP_DECK_TOP_TO_BOTTOM.slice(0, 17);
  const pile2Cards = PREPARED_FACE_UP_DECK_TOP_TO_BOTTOM.slice(17, 34);
  const pile3Cards = PREPARED_FACE_UP_DECK_TOP_TO_BOTTOM.slice(34, 52);

  return [
    {
      separationOrder: 1,
      pickupBeat: 3,
      beatWord: 'TRES',
      tablePositionLabel: 'Derecha · Tiempo «TRES»',
      topVisibleCard: pile1Cards[0],
      bottomCard: pile1Cards[pile1Cards.length - 1],
      cardCount: pile1Cards.length,
      cutLandmarkHint:
        'Pasa todos los Diamantes y los primeros Tréboles hasta ver aparecer el 5 de Tréboles. Separa ese bloque (termina en el 4 de Tréboles) y déjalo cara arriba a tu derecha.',
      cardsTopToBottom: pile1Cards,
    },
    {
      separationOrder: 2,
      pickupBeat: 2,
      beatWord: 'DOS',
      tablePositionLabel: 'Centro · Tiempo «DOS»',
      topVisibleCard: pile2Cards[0],
      bottomCard: pile2Cards[pile2Cards.length - 1],
      cardCount: pile2Cards.length,
      cutLandmarkHint:
        'Con el 5 de Tréboles a la vista, pasa el resto de Tréboles y los primeros Corazones hasta ver aparecer el 9 de Corazones. Separa ese bloque (termina en el 8 de Corazones) y déjalo cara arriba en el centro.',
      cardsTopToBottom: pile2Cards,
    },
    {
      separationOrder: 3,
      pickupBeat: 1,
      beatWord: 'UNO',
      tablePositionLabel: 'Izquierda · Tiempo «UNO»',
      topVisibleCard: pile3Cards[0],
      bottomCard: pile3Cards[pile3Cards.length - 1],
      cardCount: pile3Cards.length,
      cutLandmarkHint:
        'Deja el paquete restante cara arriba a tu izquierda. Su carta superior visible es el 9 de Corazones y en su base está el Rey de Picas.',
      cardsTopToBottom: pile3Cards,
    },
  ];
}

export const ASSEMBLY_PILES_BY_SEPARATION: readonly AssemblyPile[] =
  buildAssemblyPilesBySeparationOrder();

/**
 * Montones ordenados de izquierda a derecha sobre el tapete para la recogida («UNO», «DOS», «TRES»).
 */
export const TABLE_PILES_LEFT_TO_RIGHT: readonly AssemblyPile[] = [
  ASSEMBLY_PILES_BY_SEPARATION[2],
  ASSEMBLY_PILES_BY_SEPARATION[1],
  ASSEMBLY_PILES_BY_SEPARATION[0],
] as const;

export function buildPickupSteps(): readonly PickupStep[] {
  const [leftPile, centerPile, rightPile] = TABLE_PILES_LEFT_TO_RIGHT;
  const steps: PickupStep[] = [];
  let stepNumber = 1;

  for (let roundIdx = 0; roundIdx < 18; roundIdx++) {
    const roundNumber = roundIdx + 1;

    if (roundIdx < leftPile.cardsTopToBottom.length) {
      steps.push({
        stepNumber: stepNumber++,
        roundNumber,
        pickupBeat: 1,
        beatWord: 'UNO',
        tablePositionShort: 'Izquierda',
        card: leftPile.cardsTopToBottom[roundIdx],
      });
    }

    if (roundIdx < centerPile.cardsTopToBottom.length) {
      steps.push({
        stepNumber: stepNumber++,
        roundNumber,
        pickupBeat: 2,
        beatWord: 'DOS',
        tablePositionShort: 'Centro',
        card: centerPile.cardsTopToBottom[roundIdx],
      });
    }

    if (roundIdx < rightPile.cardsTopToBottom.length) {
      steps.push({
        stepNumber: stepNumber++,
        roundNumber,
        pickupBeat: 3,
        beatWord: 'TRES',
        tablePositionShort: 'Derecha',
        card: rightPile.cardsTopToBottom[roundIdx],
      });
    }
  }

  return steps;
}

export const PICKUP_STEPS: readonly PickupStep[] = buildPickupSteps();

/**
 * Orden de las 52 cartas de arriba abajo tras recogerlas cara arriba una sobre otra
 * y voltear el mazo completo dorso arriba:
 * Empieza en 9C (posición SSP 14), pasa por KD (39ª carta) -> 9P (40ª carta, posición SSP 1)
 * y termina en KP (52ª carta en la cara inferior, posición SSP 13).
 */
export const ASSEMBLED_FACE_DOWN_DECK_TOP_TO_BOTTOM: readonly SspCard[] = PICKUP_STEPS.map(
  (step) => step.card,
);

/**
 * Devuelve las cartas que siguen inmediatamente a la carta indicada en el ciclo SSP.
 */
export function getFollowingSspCards(card: SspCard, count = 6): readonly SspCard[] {
  const result: SspCard[] = [];
  for (let offset = 0; offset < count; offset++) {
    const idx = (card.position - 1 + 1 + offset) % DECK_SIZE;
    result.push(SSP_STACK[idx]);
  }
  return result;
}

