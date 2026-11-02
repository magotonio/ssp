# Ordenación SSP

Este documento define las reglas de la ordenación SSP, independientemente de su implementación. Es la referencia normativa del dominio para la aplicación descrita en [ESPECIFICACIONES.md](./spec/ESPECIFICACIONES.md).

## 1. La ordenación SSP: Definiciones Formales y Convenciones

Nombre de ordenación: SSP

### 1.1. Cartas y Valores (Rangos / Índices)
La baraja contiene 52 cartas sin comodines. Cada carta posee un **valor numérico** $V \in \{1, 2, \dots, 13\}$:
- **As (A)**: $1$
- **2 al 10**: Su valor nominal ($2, 3, \dots, 10$)
- **Jack / Sota (J)**: $11$
- **Queen / Reina (Q)**: $12$
- **King / Rey (K)**: $13$

Matemáticamente, los valores operan bajo aritmética modular en $\mathbb{Z}_{13}$ con representación en el rango estándar $[1, 13]$.

### 1.2. Palos (Suits)
Los 4 palos se ordenan cíclicamente del 1 al 4:
1. **Pica (P)**: Valor de palo $1$ (Color: **Negro**)
2. **Corazón (C)**: Valor de palo $2$ (Color: **Rojo**)
3. **Trébol (T)**: Valor de palo $3$ (Color: **Negro**)
4. **Diamante (D)**: Valor de palo $4$ (Color: **Rojo**)

Ciclo canónico de palos: $P \to C \to T \to D \to P \dots$
- **Colores**:
  - Negros: $P (1)$ y $T (3)$ (palos impares).
  - Rojos: $C (2)$ y $D (4)$ (palos pares).
- **Palos Gemelos / Homólogos**: Aquellos del mismo color separados por distancia 2 en el ciclo:
  - $P \leftrightarrow T$ (Negros)
  - $C \leftrightarrow D$ (Rojos)

### 1.3. Notación
Cada carta se representa mediante la tupla $(V, S)$ o la cadena abreviada `[Valor][Palo]`, por ejemplo:
- `9P` = $(9, 1)$: 9 de Picas
- `5C` = $(5, 2)$: 5 de Corazones
- `AT` = $(1, 3)$: As de Tréboles
- `KD` = $(13, 4)$: Rey de Diamantes

---

## 2. Algoritmo de Generación y Definición Matemática

### 2.1. Estado Inicial
La primera carta de la ordenación es el **9 de Picas**:
$$C_1 = (V_1, S_1) = (9, 1) = 9\text{P}$$

### 2.2. Regla de Transición $(V_n, S_n) \longrightarrow (V_{n+1}, S_{n+1})$

Dada la carta en posición $n$, $C_n = (V_n, S_n)$, la carta siguiente $C_{n+1} = (V_{n+1}, S_{n+1})$ se define formalmente mediante dos casos basados en el cálculo $V_n - 4$:

#### Caso A: Si $V_n - 4 \ge 1$ (Resultado positivo dentro del rango)
- **Valor**: Se resta 4:
  $$V_{n+1} = V_n - 4$$
- **Palo**: Se avanza **1 palo** en el ciclo:
  $$S_{n+1} = (S_n \pmod 4) + 1$$

#### Caso B: Si $V_n - 4 \le 0$ (Resultado no positivo: $V_n \in \{1, 2, 3, 4\}$)
- **Valor**: Se suma 9 (equivalente a $-4 \pmod{13}$):
  $$V_{n+1} = V_n + 9$$
- **Palo**: Se avanzan **2 palos** en el ciclo:
  $$S_{n+1} = ((S_n + 1) \pmod 4) + 1$$

#### Unificación Algebraica
- En el espacio de valores $\mathbb{Z}_{13}$:
  $$V_{n+1} \equiv V_n - 4 \equiv V_n + 9 \pmod{13}$$
- El desfase de palos $\Delta S(V)$ depende exclusivamente de si $V \le 4$:
  $$\Delta S(V) = \begin{cases} 1, & \text{si } V \ge 5 \\ 2, & \text{si } V \le 4 \end{cases}$$
  $$S_{n+1} = ((S_n - 1 + \Delta S(V_n)) \pmod 4) + 1$$

### 2.3. Secuencia Completa de las 52 Cartas

| Pos | Carta | Pos | Carta | Pos | Carta | Pos | Carta |
|:---:|:-----:|:---:|:-----:|:---:|:-----:|:---:|:-----:|
| **1** | `9P` | **14** | `9C` | **27** | `9T` | **40** | `9D` |
| **2** | `5C` | **15** | `5T` | **28** | `5D` | **41** | `5P` |
| **3** | `AT` | **16** | `AD` | **29** | `AP` | **42** | `AC` |
| **4** | `10P` | **17** | `10C` | **30** | `10T` | **43** | `10D` |
| **5** | `6C` | **18** | `6T` | **31** | `6D` | **44** | `6P` |
| **6** | `2T` | **19** | `2D` | **32** | `2P` | **45** | `2C` |
| **7** | `JP` | **20** | `JC` | **33** | `JT` | **46** | `JD` |
| **8** | `7C` | **21** | `7T` | **34** | `7D` | **47** | `7P` |
| **9** | `3T` | **22** | `3D` | **35** | `3P` | **48** | `3C` |
| **10** | `QP` | **23** | `QC` | **36** | `QT` | **49** | `QD` |
| **11** | `8C` | **24** | `8T` | **37** | `8D` | **50** | `8P` |
| **12** | `4T` | **25** | `4D` | **38** | `4P` | **51** | `4C` |
| **13** | `KP` | **26** | `KC` | **39** | `KT` | **52** | `KD` |

**Cierre del Ciclo**: Al aplicar la regla sobre la carta 52 (`KD`, $V=13, S=4$):
- $13 - 4 = 9 \ge 1 \implies V_{53} = 9$
- Avanza 1 palo desde Diamante (4) $\implies S_{53} = 1$ (Pica)
- Carta 53 = `9P` ($C_1$). El ciclo se cierra exactamente con periodo 52, recorriendo **todas las 52 cartas sin repetición**.
