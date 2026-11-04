# Reglas y Propiedades de la Ordenación SSP (Si Stebbins Poderosa)

Este documento recopila, formaliza y explica las **11 reglas y propiedades fundamentales** de la ordenación cartomágica **SSP (Si Stebbins Poderosa)**. 

A diferencia del sistema *Si Stebbins* clásico, la ordenación SSP elimina los patrones visibles evidentes (como la alternancia fija rojo/negro o par/impar), conservando al mismo tiempo una estructura matemática rigurosa, predecible y de gran potencia mnemotécnica.

---

## 1. Regla de la Carta Siguiente (Transición de Valor y Palo)

Permite deducir de inmediato qué carta sigue a cualquier carta dada (o carta cortada) mediante una sencilla operación aritmética sobre el índice y un avance en la secuencia canónica de palos: **Picas ($\spadesuit$) $\to$ Corazones ($\heartsuit$) $\to$ Tréboles ($\clubsuit$) $\to$ Diamantes ($\diamondsuit$)**.

* **Cálculo del Índice / Valor:**
  * **Regla general:** Se restan **4** al valor de la carta actual:
    $$V_{\text{sig}} = V - 4$$
  * **Valores bajos (As, 2, 3 y 4):** Como la resta daría un número no positivo ($\le 0$), se **suman 9** (operación matemáticamente equivalente a $-4 \pmod{13}$):
    $$V_{\text{sig}} = V + 9$$

* **Cálculo del Palo:**
  * **Si se restó 4** (valores del 5 al Rey): Se avanza **1 palo** en el ciclo ($P \to C \to T \to D \to P$).
  * **Si se sumó 9** (valores As, 2, 3 y 4): Se produce un **salto de palo**, avanzando **2 palos** en el ciclo (saltando al palo homólogo del mismo color: Picas $\leftrightarrow$ Tréboles, Corazones $\leftrightarrow$ Diamantes).

> **Ejemplos:**
> * Partiendo del **$9\spadesuit$**: $9 - 4 = 5$; avanzamos 1 palo ($\spadesuit \to \heartsuit$) $\implies$ **$5\heartsuit$**.
> * Partiendo del **$A\clubsuit$** ($V=1$): No se puede restar 4, sumamos 9 ($1 + 9 = 10$); avanzamos 2 palos ($\clubsuit \to \spadesuit$) $\implies$ **$10\spadesuit$**.

---

## 2. Naturaleza Cíclica

La ordenación constituye un **bucle cerrado continuo** de 52 cartas sin principio ni fin absoluto.

* **Explicación:** Al llegar a la carta 52 del orden estándar ($K\diamondsuit$, $V=13$), la regla de transición aplica:
  $$13 - 4 = 9, \quad \text{Diamantes } + 1 \text{ palo} = \text{Picas} \implies 9\spadesuit$$
  Esto enlaza de nuevo con la carta 1 sin discontinuidades.
* **Aplicación mágica:** La baraja puede cortarse libremente tantas veces como se desee (o ejecutarse cortes en falso y mezclas por corte) sin alterar las relaciones de vecindad ni romper las propiedades del sistema.

---

## 3. Punto de Partida Canónico (9 de Picas)

Aunque la baraja sea cíclica, la **ordenación estándar de referencia** se establece fijando el **9 de Picas ($9\spadesuit$) en la posición 1** y cerrando con el **Rey de Diamantes ($K\diamondsuit$) en la posición 52**.

* **Explicación:** Anclar el $9\spadesuit$ en la primera posición define un sistema de coordenadas absoluto necesario para estructurar la baraja en cuartos exactos (los cuatro "reinos"), facilitando el cálculo de posiciones numéricas fijas (del 1 al 52) y la estimación de cortes al tacto.

---

## 4. Estructura de Baraja Rosario (Periodicidad de 13 Índices)

La secuencia de los 13 valores numéricos es fija y se repite exactamente **4 veces** a lo largo de la baraja completa.

* **Explicación:** Los valores numéricos recorren de forma invariable el ciclo de 13 índices:
  $$\mathbf{9 \to 5 \to A \to 10 \to 6 \to 2 \to J \to 7 \to 3 \to Q \to 8 \to 4 \to K}$$
* Cada bloque de 13 cartas contiene los 13 valores sin repetir ninguno. Al repetirse 4 veces ($13 \times 4 = 52$), la posición relativa de cualquier número dentro de su grupo de 13 es idéntica en cualquier bloque de la baraja, variando únicamente los palos asignados.

---

## 5. Distribución por Reinos (Nobles, Políticos y Científicos)

Para localizar cualquier carta sin memorizar listas de 52 posiciones, la baraja se divide en **cuatro bloques de 13 cartas** llamados **Reinos**:

1. **Reino de Picas:** Cartas 1 a 13 (desfase $+0$).
2. **Reino de Corazones:** Cartas 14 a 26 (desfase $+13$).
3. **Reino de Tréboles:** Cartas 27 a 39 (desfase $+26$).
4. **Reino de Diamantes:** Cartas 40 a 52 (desfase $+39$).

Para identificar al instante en qué reino vive una carta según su valor y su palo, se recurre a una clasificación metafórica de tres personajes:

* **Los Nobles (Valores altos: 9, 10, J, Q, K):**
  * *"Dicen la verdad"*: Pertenecen al reino que coincide exactamente con su propio palo.
  * *Ejemplo:* El $10\heartsuit$ está en el Reino de Corazones (bloque 2); el $K\spadesuit$ está en el Reino de Picas (bloque 1).
* **Los Políticos (Valores bajos: As, 2, 3, 4):**
  * *"Mienten sobre su palo pero dicen la verdad sobre su color"*: Pertenecen al reino del otro palo de su mismo color (su palo homólogo: $\spadesuit \leftrightarrow \clubsuit$ en negros, $\heartsuit \leftrightarrow \diamondsuit$ en rojos).
  * *Ejemplo:* El $3\heartsuit$ está en el Reino de Diamantes (bloque 4); el $2\clubsuit$ está en el Reino de Picas (bloque 1).
* **Los Científicos (Valores medios: 5, 6, 7, 8):**
  * *"Van adelantados a su época"*: Pertenecen al reino del palo que antecede al suyo en el ciclo canónico ($P \leftarrow C \leftarrow T \leftarrow D \leftarrow P$).
  * *Ejemplo:* El $8\heartsuit$ está en el Reino de Picas (bloque 1); el $5\clubsuit$ está en el Reino de Corazones (bloque 2); el $7\diamondsuit$ está en el Reino de Tréboles (bloque 3).

---

## 6. Posiciones Internas (Fórmula del $\times 3$)

Dentro de cualquier reino, la posición del 1 al 13 que ocupa cada carta se obtiene multiplicando su valor nominal $V$ por 3 en aritmética de módulo 13:

$$\text{Posición Interna} \equiv (V \times 3) \pmod{13} \quad (\text{si el residuo es } 0, \text{ corresponde a la posición } 13)$$

* **Cálculo directo:**
  * **As ($1 \times 3$):** Posición 3.
  * **2 ($2 \times 3$):** Posición 6.
  * **3 ($3 \times 3$):** Posición 9.
  * **4 ($4 \times 3$):** Posición 12.
  * **5 ($15 - 13$):** Posición 2.
  * **6 ($18 - 13$):** Posición 5.
  * **7 ($21 - 13$):** Posición 8.
  * **8 ($24 - 13$):** Posición 11.
  * **9 ($27 - 26$):** Posición 1 (inicio de reino).
  * **10 ($30 - 26$):** Posición 4.
  * **J / 11 ($33 - 26$):** Posición 7.
  * **Q / 12 ($36 - 26$):** Posición 10.
  * **K / 13 ($39 - 26$):** Posición 13 (final de reino).

> **Localización absoluta (1 a 52):**
> $$\text{Posición Absoluta} = \text{Desfase del Reino} + \text{Posición Interna}$$
> *Ejemplo:* ¿Dónde está el **$7\diamondsuit$**?
> 1. Es un *Científico* de Diamantes $\implies$ Vive en el Reino de Tréboles (desfase $+26$).
> 2. Posición interna del 7: $7 \times 3 = 21 \to 21 - 13 = 8$.
> 3. Posición absoluta: $26 + 8 = \mathbf{34}$.

---

## 7. Separación Regular de Cartas del Mismo Palo (Distancia 3 Ascendente)

A lo largo de la baraja completa, las cartas de un mismo palo aparecen distribuidas a una distancia fija de **3 cartas** entre sí, en estricto orden correlativo ascendente desde el As hasta el Rey:

$$\text{Posición}(V+1, S) = \text{Posición}(V, S) + 3$$

* **Explicación:**
  Si observamos las 13 Picas en la ordenación estándar:
  * $A\spadesuit$ (pos 29) $\to 2\spadesuit$ (pos 32) $\to 3\spadesuit$ (pos 35) $\to 4\spadesuit$ (pos 38)
  * $\to 5\spadesuit$ (pos 41) $\to 6\spadesuit$ (pos 44) $\to 7\spadesuit$ (pos 47) $\to 8\spadesuit$ (pos 50)
  * $\to 9\spadesuit$ (pos 1, pues $50 + 3 = 53 \equiv 1$) $\to 10\spadesuit$ (pos 4) $\to J\spadesuit$ (pos 7) $\to Q\spadesuit$ (pos 10) $\to K\spadesuit$ (pos 13).
* Cada carta del mismo palo avanza de 3 en 3 posiciones de forma ascendente. La única excepción a este paso de 3 ocurre en el cierre del ciclo del palo (entre el Rey y el As), donde la distancia entre el Rey (pos 13) y el As (pos 29) es de 16 cartas.

---

## 8. No Repetición de Palos en Tríos Consecutivos

En cualesquiera **tres cartas consecutivas** tomadas de la baraja jamás se repite un palo; los tres palos son siempre distintos.

* **Explicación:**
  * Para avanzar un palo idéntico se necesitaría una suma modular de palos múltiplo de 4.
  * La regla de transición avanza 1 palo (para valores $\ge 5$) o 2 palos (para valores $\le 4$).
  * En la secuencia de 13 índices (`9, 5, A, 10, 6, 2, J, 7, 3, Q, 8, 4, K`), entre dos valores bajos ($\le 4$) median siempre al menos dos cartas de valores altos.
  * Por ello, nunca se acumulan dos saltos dobles seguidos, garantizando que en toda terna $(C_n, C_{n+1}, C_{n+2})$ intervengan tres palos completamente diferentes.

---

## 9. Teorema de la Suma de 3 Cartas (Deducción de Posición Interna)

Si se suman los valores nominales de **tres cartas consecutivas** y a la suma total se le **resta 14**, el resultado obtenido es exactamente la **posición interna** (del 1 al 13) de la primera de esas tres cartas:

$$\text{Posición Interna}(C_1) = (V_1 + V_2 + V_3) - 14$$

* **Comprobación matemática:**
  La suma de tres cartas consecutivas genera una progresión lineal estricta que va desde 15 hasta 27:
  * Trío iniciando en **9** ($9 + 5 + 1 = 15$): $15 - 14 = \mathbf{1}$ (el 9 ocupa la 1.ª posición interna).
  * Trío iniciando en **5** ($5 + 1 + 10 = 16$): $16 - 14 = \mathbf{2}$ (el 5 ocupa la 2.ª posición interna).
  * Trío iniciando en **A** ($1 + 10 + 6 = 17$): $17 - 14 = \mathbf{3}$ (el As ocupa la 3.ª posición interna).
  * Trío iniciando en **10** ($10 + 6 + 2 = 18$): $18 - 14 = \mathbf{4}$ (el 10 ocupa la 4.ª posición interna).
  * Trío iniciando en **6** ($6 + 2 + 11 = 19$): $19 - 14 = \mathbf{5}$ (el 6 ocupa la 5.ª posición interna).
  * Trío iniciando en **2** ($2 + 11 + 7 = 20$): $20 - 14 = \mathbf{6}$ (el 2 ocupa la 6.ª posición interna).
  * Trío iniciando en **J** ($11 + 7 + 3 = 21$): $21 - 14 = \mathbf{7}$ (la J ocupa la 7.ª posición interna).
  * Trío iniciando en **7** ($7 + 3 + 12 = 22$): $22 - 14 = \mathbf{8}$ (el 7 ocupa la 8.ª posición interna).
  * Trío iniciando en **3** ($3 + 12 + 8 = 23$): $23 - 14 = \mathbf{9}$ (el 3 ocupa la 9.ª posición interna).
  * Trío iniciando en **Q** ($12 + 8 + 4 = 24$): $24 - 14 = \mathbf{10}$ (la Q ocupa la 10.ª posición interna).
  * Trío iniciando en **8** ($8 + 4 + 13 = 25$): $25 - 14 = \mathbf{11}$ (el 8 ocupa la 11.ª posición interna).
  * Trío iniciando en **4** ($4 + 13 + 9 = 26$): $26 - 14 = \mathbf{12}$ (el 4 ocupa la 12.ª posición interna).
  * Trío iniciando en **K** ($13 + 9 + 5 = 27$): $27 - 14 = \mathbf{13}$ (el Rey ocupa la 13.ª posición interna).

---

## 10. Alternancia de Colores por Eliminación de Tetráadas

En la ordenación SSP completa, los colores rojo y negro no alternan de forma previsible, lo que evita sospechas en el público. Sin embargo, si se retira un conjunto selecto de 4 valores (16 cartas en total), las 36 cartas restantes adquieren una **rigurosa alternancia de color (Rojo - Negro - Rojo - Negro)**:

* **Opción 1: Retirar As, 2, 3 y 4 (Los Políticos)**
  * *Razón:* Los valores bajos son los únicos que provocan el "salto de palo" al palo homólogo del mismo color (negro $\to$ negro, rojo $\to$ rojo). Al eliminarlos, cada carta restante avanza siempre 1 solo palo ($P \to C \to T \to D$), garantizando alternancia cromática perfecta continua.
* **Opción 2: Retirar 10, J, Q y K**
  * *Razón:* Son las cuatro cartas que reciben el salto generado por los políticos. Su retirada cancela las coincidencias cromáticas contiguas.
* **Opción 3: Retirar J, Q, K y As**
  * *Razón:* Al eliminar la tetráada que articula la transición modular entre el ciclo superior e inferior, los enlaces cromáticos resultantes quedan igualmente sincronizados en alternancia de color.

---

## 11. Construcción Rápida Mediante 17 Montones

Permite ordenar una baraja completa de 52 cartas en ordenación SSP de forma mecánica y automática, partiendo de una baraja nueva o agrupada por palos:

### Procedimiento
1. **Preparación previa de la baraja:**
   Se apilan los cuatro palos ordenados de **Rey a As** de arriba hacia abajo (o por bloques):
   * Fondo del mazo: **Picas** (Rey al As).
   * Segundo bloque: **Corazones** (Rey al As).
   * Tercer bloque: **Tréboles** (Rey al As).
   * Parte superior: **Diamantes** (Rey al As).
2. **Reparto en 17 montones:**
   Se reparten las 52 cartas de una en una sobre la mesa formando **17 montones correlativos** (carta 1 al montón 1, carta 2 al montón 2... hasta el 17, repitiendo la vuelta hasta repartir las 52 cartas).
3. **Recogida:**
   Al recoger los 17 montones en orden correlativo, la baraja queda configurada en la ordenación **SSP completa**.

### Fundamento Matemático
Dado que $17$ es coprimo con 52 ($\gcd(17, 52) = 1$) y satisface la relación $17 \times 3 = 51 \equiv -1 \pmod{52}$, el reparto en 17 montones ejecuta un entrelazado modular perfecto de paso 3 que descompone y recoloca los 4 palos en la secuencia cíclica y armónica de la SSP.

