# Especificaciones Técnicas y Guía de Estilos

Esta guía de diseño y especificaciones está redactada para el equipo de diseño UI/UX y maquetación frontend, orientada a reproducir con precisión el estilo minimalista, plano (*flat design*) y funcional del mockup.

---

## 1. Filosofía de Diseño y UX

* **Enfoque general:** Minimalismo moderno, funcional y libre de distracciones. Se eliminan degradados, sombras difusas pronunciadas y efectos 3D.
* **Jerarquía visual:** Estructura modular basada en tarjetas contiguas pero claramente delimitadas por contraste de fondo y bordes sutiles.
* **Carga cognitiva reducida:** Al ser una plataforma de entrenamiento de memoria y estudio activo, el espacio negativo (espaciado generoso) es prioritario para evitar la saturación visual.



---

## 2. Paleta de Colores

| Rol del Color | Token / Nombre | Valor Hex | Uso Principal |
| --- | --- | --- | --- |
| **Fondo Principal** | `bg-canvas` | `#F8F9FA` | Fondo general de la aplicación (off-white neutro cálido).

 |
| **Fondo de Tarjetas** | `bg-surface` | `#FFFFFF` | Fondos de módulos, tarjetas de contenido y paneles.

 |
| **Texto Primario** | `text-primary` | `#1A202C` | Títulos, encabezados y cifras principales.

 |
| **Texto Secundario** | `text-muted` | `#64748B` | Subtítulos, metadatos, iconos inactivos y bordes tenues.

 |
| **Base / Primario** | `color-navy` | `#1E293B` | Botones principales de confirmación, barras de navegación activas y elementos clave.

 |
| **Acento Vibrante** | `color-accent` | `#F97316` | Botones de llamada a la acción directos (*Practice*, alertas, estados activos seleccionados).

 |
| **Secundarios / Módulos** | `accent-teal` / `accent-coral` | `#06B6D4` / `#FB7185` | Chips de ejercicios interactivos, categorías y diagramas de flujo.

 |

---

## 3. Tipografía

* **Familia tipográfica recomendada:** Sans-Serif geométrica o neo-grotesca moderna (p. ej., *Inter*, *Plus Jakarta Sans* o *SF Pro Display*).
* **Escala y pesos:**
* **H1 (Saludo / Sección Principal):** `24px` – `28px` | Peso: `700` (Bold) | Color: `text-primary`.


* **H2 (Títulos de Tarjetas / Módulos):** `16px` – `18px` | Peso: `600` (SemiBold) | Color: `text-primary`.


* **Body / Párrafos:** `14px` | Peso: `400` (Regular) | Color: `text-muted`.


* **Etiquetas y Botones:** `12px` – `13px` | Peso: `500` (Medium) | Letra condensada, legible a tamaños reducidos.





---

## 4. Estructura y Sistema de Retícula (Grid)

* **Layout general:** Disposición fluida en pantalla completa (desktop 16:9) dividida en dos zonas:
1. **Sidebar lateral izquierdo:** Ancho fijo de `240px` a `260px`.


2. **Área de contenido principal:** Sistema CSS Grid de 12 columnas con *gap* de `20px` a `24px`.




* **Modularidad de tarjetas (*Cards*):**
* Radio de borde (`border-radius`): `12px`.


* Borde: `1px solid #E2E8F0` (sin sombras ni elevaciones pronunciadas; apariencia plana).
* *Padding* interno: `20px` uniforme en cada tarjeta.





---

## 5. Especificaciones de Componentes

### Sidebar (Navegación Izquierda)

* **Logotipo:** Cuadrante superior izquierdo con isotipo plano y nombre de la academia.


* **Ítems de menú:** Lista vertical con espaciado de `8px` entre ítems.


* Estado pasivo: Icono lineal + texto en `text-muted`.


* Estado activo: Fondo relleno en `color-navy` suave o gris pizarra (`#E2E8F0`), texto e icono en alto contraste.




* **Zona inferior:** Acceso directo a Configuración fijado al pie del sidebar.



### Tarjeta 1: Reproductor de Lección Actual (*Current Lesson*)

* **Estructura interna:** 2 columnas (50% / 50%).


* **Izquierda:** Contenedor de video en ratio 16:9 con botón de *play* central y barra de progreso plana en la parte inferior.


* **Derecha:** Lista de viñetas con los puntos de la lección (técnicas de mnemotecnia, palacio de la memoria, etc.).





### Tarjeta 2: Módulo Interactivo (*Interactive Training*)

* **Matriz de ejercicios:** Cuadrícula de fichas planas de colores (bloques de memorización rápida o *chunking*).


* **Acciones:** Grupo de dos botones horizontales al pie: botón secundario neutro (*Test Memory*) y botón de acción directa en acento naranja (*Practice*).



### Tarjeta 3: Módulo de Estudio Activo / Diagramas (*Active Study*)

* **Visualización de flujo:** Representación vectorial plana de modelos conceptuales (p. ej., etapas de la memoria: sensorial $\rightarrow$ operativa $\rightarrow$ largo plazo) interconectadas mediante flechas lineales.



### Tarjeta 4: Progreso Diario (*Daily Progress*)

* **Métricas visuales:**
* Mini gráfico de barras verticales planas para actividad semanal.


* Indicador circular plano de porcentaje completado.


* Botones de pie de tarjeta con estilo de botón plano sólido (`color-navy`).





---

## 6. Pautas de Interacción y Accesibilidad (WCAG)

* **Contraste:** Todo texto sobre fondos coloreados (como el botón naranja o la barra azul marino) debe superar el ratio mínimo de contraste de 4.5:1 (WCAG AA).
* **Estados interactivos:**
* *Hover* en botones: Oscurecimiento directo del fondo en un 8% mediante filtros CSS (`filter: brightness(0.92)`), sin animaciones 3D ni elevaciones de sombra.
* Foco accesible: Contorno visible de `2px solid #06B6D4` para navegación completa por teclado.


* **Iconografía:** Líneas simples (*stroke width* constante de `1.5px` o `2px`), formato SVG inline y tamaño estándar de `20x20px`.