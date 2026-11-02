La **Lección 2** de la ordenación **SSP (Si Stebbins Poderosa)** se centra exclusivamente en explicar la regla matemática para calcular cuál es el **siguiente índice o valor numérico** tras cortar por cualquier carta.

### **1. El concepto de índice y la regla de resta**
* Los índices abarcan los valores del **As al Rey** (\\(A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K\\)).
* La regla principal para determinar qué número sigue a otro consiste en **restar 4** al valor actual.

### **2. Regla de cálculo y gestión de valores bajos**
* La secuencia de valores se organiza en bloques de 13 cartas iniciando siempre en el número **9** y restando 4 consecutivamente:
  * **9** \\(- 4 =\\) **5**
  * **5** \\(- 4 =\\) **1 (As)**
* **Suma de 9 para resultados no positivos:** Cuando al restar 4 se obtiene un valor menor o igual a 0 (al estar en el As, 2, 3 o 4), en lugar de restar se debe **sumar 9** (o retroceder cuatro posiciones entre las cartas altas: Rey, Q, J, 10):
  * **1 (As)** \\(+ 9 =\\) **10**
  * **10** \\(- 4 =\\) **6**
  * **6** \\(- 4 =\\) **2**
  * **2** \\(+ 9 =\\) **11 (Sota / J)**
  * **11 (J)** \\(- 4 =\\) **7**
  * **7** \\(- 4 =\\) **3**
  * **3** \\(+ 9 =\\) **12 (Reina / Q)**
  * **12 (Q)** \\(- 4 =\\) **8**
  * **8** \\(- 4 =\\) **4**
  * **4** \\(- 4 =\\) **0 (Rey / K)**
* El **Rey** actúa como valor **0** (o 13), de modo que al sumarle 9 (\\(0 + 9 = 9\\)) se reinicia el ciclo en el 9.

### **3. Secuencia resultante y memorización**
* La serie de índices que se genera es: **9, 5, 1 (As), 10, 6, 2, J, 7, 3, Q, 8, 4, K**.
* Aunque la secuencia termina memorizándose por repetición, la ventaja del sistema es que siempre permite recurrir al cálculo mental o al conteo con los dedos si se olvida algún paso.

### **4. Método de práctica y cierre**
* Se recomienda tomar las cartas de un solo palo, mezclarlas e ir sacando cartas al azar (por ejemplo, un 6 o una J) para deducir cuál es el índice que le sigue (el 2 o el 7).
* La lección concluye indicando que en la **Lección 3** se abordará el funcionamiento y la secuencia de los **palos**.