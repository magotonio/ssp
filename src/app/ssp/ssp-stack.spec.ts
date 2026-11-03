import {
  CIRCLE_CONSTRUCTION_STEPS,
  DECK_SIZE,
  END_CARD_SLOT_INDEX,
  SSP_STACK,
  START_CARD_SLOT_INDEX,
  SUITS,
} from './ssp-stack';

describe('Dominio de la ordenación SSP y reloj de 52 puntos', () => {
  it('genera las 52 cartas únicas desde 9P hasta KD conforme a ordenacion-ssp.md', () => {
    expect(SSP_STACK).toHaveLength(52);
    expect(new Set(SSP_STACK.map((c) => c.code)).size).toBe(52);
    expect(SSP_STACK[0].code).toBe('9P');
    expect(SSP_STACK[1].code).toBe('5C');
    expect(SSP_STACK[2].code).toBe('AT');
    expect(SSP_STACK[3].code).toBe('10P');
    expect(SSP_STACK[13].code).toBe('9C');
    expect(SSP_STACK[26].code).toBe('9T');
    expect(SSP_STACK[28].code).toBe('AP');
    expect(SSP_STACK[39].code).toBe('9D');
    expect(SSP_STACK[51].code).toBe('KD');
  });

  it('define 4 colores diferenciados para los 4 palos', () => {
    expect(SUITS).toHaveLength(4);
    expect(new Set(SUITS.map((s) => s.dotColor)).size).toBe(4);
  });

  it('reparte los 52 puntos desde AP en las 12 en punto sin solapamientos y coincide con SSP al leer desde 9P', () => {
    expect(CIRCLE_CONSTRUCTION_STEPS).toHaveLength(52);

    // El As de Picas se coloca en el hueco 0 (arriba a las 12)
    expect(CIRCLE_CONSTRUCTION_STEPS[0].card.code).toBe('AP');
    expect(CIRCLE_CONSTRUCTION_STEPS[0].slotIndex).toBe(0);

    // Ningún hueco se pisa
    const occupiedSlots = new Set(CIRCLE_CONSTRUCTION_STEPS.map((s) => s.slotIndex));
    expect(occupiedSlots.size).toBe(52);

    // El As de cada nuevo palo se sitúa justo después del 5 del palo anterior
    const slotByCode = new Map(
      CIRCLE_CONSTRUCTION_STEPS.map((s) => [s.card.code, s.slotIndex]),
    );
    expect(slotByCode.get('AC')).toBe(((slotByCode.get('5P') ?? 0) + 1) % DECK_SIZE);
    expect(slotByCode.get('AT')).toBe(((slotByCode.get('5C') ?? 0) + 1) % DECK_SIZE);
    expect(slotByCode.get('AD')).toBe(((slotByCode.get('5T') ?? 0) + 1) % DECK_SIZE);

    // Al leer el reloj en sentido horario desde el 9P (START_CARD_SLOT_INDEX) hasta KD (END_CARD_SLOT_INDEX),
    // se obtiene exactamente la secuencia normativa SSP_STACK
    const cardBySlot = new Map(
      CIRCLE_CONSTRUCTION_STEPS.map((s) => [s.slotIndex, s.card.code]),
    );
    const clockwiseFrom9P: string[] = [];
    for (let offset = 0; offset < DECK_SIZE; offset++) {
      const slot = (START_CARD_SLOT_INDEX + offset) % DECK_SIZE;
      clockwiseFrom9P.push(cardBySlot.get(slot) ?? '');
    }

    expect(clockwiseFrom9P).toEqual(SSP_STACK.map((c) => c.code));
    expect((END_CARD_SLOT_INDEX + 1) % DECK_SIZE).toBe(START_CARD_SLOT_INDEX);
  });
});

