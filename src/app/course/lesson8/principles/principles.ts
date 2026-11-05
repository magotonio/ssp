import { Type } from '@angular/core';
import { Principle01Cyclic } from './principle-01-cyclic';
import { Principle02NextCard } from './principle-02-next-card';
import { Principle03Period13 } from './principle-03-period-13';
import { Principle04Period26 } from './principle-04-period-26';
import { Principle05CanonicalStart } from './principle-05-canonical-start';
import { Principle06Kingdoms } from './principle-06-kingdoms';
import { Principle07TimesThree } from './principle-07-times-three';
import { Principle08DistanceThree } from './principle-08-distance-three';
import { Principle09Parity } from './principle-09-parity';
import { Principle10SuitTrios } from './principle-10-suit-trios';
import { Principle11ThreeSum } from './principle-11-three-sum';
import { Principle12Colors } from './principle-12-colors';
import { Principle13SeventeenPiles } from './principle-13-seventeen-piles';

export interface PrincipleMeta {
  readonly number: number;
  readonly title: string;
  readonly statement: string;
  readonly component: Type<unknown>;
}

/**
 * Registro ordenado de los 13 principios (por importancia). Para añadir o modificar un
 * principio basta con editar su componente y esta entrada; la lección no cambia.
 * Contenido de referencia: docs/principios-ssp.md.
 */
export const PRINCIPLES: readonly PrincipleMeta[] = [
  {
    number: 1,
    title: 'Naturaleza cíclica',
    statement:
      'La baraja es un bucle cerrado de 52 cartas que permite cortes libres sin alterar las relaciones de vecindad.',
    component: Principle01Cyclic,
  },
  {
    number: 2,
    title: 'Regla de la carta siguiente',
    statement:
      'Se resta 4 al índice (o se suma 9 si es 4 o menos) y se avanza 1 palo (o 2 palos si el índice es 4 o menos).',
    component: Principle02NextCard,
  },
  {
    number: 3,
    title: 'Periodicidad de 13 cartas',
    statement:
      'A 13 cartas de distancia reaparece el mismo índice y el palo avanza en el orden canónico.',
    component: Principle03Period13,
  },
  {
    number: 4,
    title: 'Periodicidad de 26 cartas: la carta homónima',
    statement:
      'A 26 cartas de distancia, a media baraja, está la carta homónima: mismo índice y mismo color.',
    component: Principle04Period26,
  },
  {
    number: 5,
    title: 'Punto de partida canónico',
    statement: 'El 9♠ ocupa la posición 1 y el K♦ cierra la ordenación en la posición 52.',
    component: Principle05CanonicalStart,
  },
  {
    number: 6,
    title: 'Distribución por reinos',
    statement:
      'Las 52 cartas se dividen en 4 bloques de 13 (Picas, Corazones, Tréboles y Diamantes) según su palo y su valor.',
    component: Principle06Kingdoms,
  },
  {
    number: 7,
    title: 'Posiciones internas: la fórmula del ×3',
    statement:
      'La posición (1–13) de cada carta dentro de su reino es su valor nominal por 3, en módulo 13.',
    component: Principle07TimesThree,
  },
  {
    number: 8,
    title: 'Separación regular de palos',
    statement:
      'Las cartas de un mismo palo aparecen a una distancia fija de 3 posiciones, en orden ascendente de As a Rey.',
    component: Principle08DistanceThree,
  },
  {
    number: 9,
    title: 'Alternancia de paridad de la suma',
    statement:
      'La suma índice + palo (P=1, C=2, T=3, D=4) alterna entre par e impar en cada carta sucesiva.',
    component: Principle09Parity,
  },
  {
    number: 10,
    title: 'No repetición de palos en tríos',
    statement: 'En tres cartas consecutivas intervienen siempre tres palos diferentes.',
    component: Principle10SuitTrios,
  },
  {
    number: 11,
    title: 'Teorema de la suma de 3 cartas',
    statement:
      'La suma de los valores de tres cartas consecutivas menos 14 es la posición interna de la primera carta.',
    component: Principle11ThreeSum,
  },
  {
    number: 12,
    title: 'Alternancia de colores al retirar 4 índices',
    statement:
      'Al retirar 4 índices con sus respectivos palos (16 cartas), las 36 restantes adquieren una alternancia perfecta de color rojo y negro.',
    component: Principle12Colors,
  },
  {
    number: 13,
    title: 'Construcción rápida en 17 montones',
    statement:
      'Repartir la baraja organizada por palos de Rey a As en 17 montones y recogerlos en orden genera la ordenación SSP.',
    component: Principle13SeventeenPiles,
  },
];

