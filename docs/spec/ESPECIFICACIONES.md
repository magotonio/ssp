# Especificaciones de la aplicación SSP

## 1. Alcance del documento

Este documento recoge los requisitos funcionales y técnicos de la aplicación web SSP. La definición matemática de la ordenación se mantiene por separado en [ordenacion-ssp.md](../ordenacion-ssp.md), que es la referencia normativa para cartas, palos, notación, algoritmo y secuencia.

Las reglas de la ordenación no se duplican aquí. Cualquier funcionalidad que las utilice debe respetar dicha referencia.

## 2. Plataforma y tecnologías

- Aplicación web con interfaz HTML desarrollada con Angular.
- Stack de la aplicación raíz: Angular 22, TypeScript estricto y Tailwind CSS v4. Se aprueba Angular 22 en lugar de Angular 21 para trabajar con Node 26.
- [ssp-mockup](../../ssp-mockup) también utiliza Angular 22. Las lecciones existentes no se migran ni modifican.
- PHP 8.2 y MariaDB únicamente si se determina que hace falta un backend; su necesidad y alcance están pendientes de definir.

## 3. Requisitos generales de interfaz

- Textos en español y formato regional español.
- Diseño responsive.
- Accesibilidad: etiquetas, navegación por teclado, gestión del foco y atributos ARIA cuando correspondan.
- Estados de carga, error y ausencia de datos cuando correspondan.

## 4. Mockup de interfaz aprobado

- Aplicación standalone independiente en [ssp-mockup](../../ssp-mockup), sin backend ni servicios externos.
- Panel de entrenamiento de memoria inspirado en [design.md](design.md): navegación lateral, cabecera, métricas, lección ilustrada, reto de secuencias, diagrama de memoria, gráfico semanal, biblioteca y formulario de sesión.
- Navegación por anclas dentro de una única página, adaptable a móvil, tableta y escritorio. Menú móvil desplegable.
- Interacciones locales: abrir y completar una lección de ejemplo, memorizar y reproducir cuatro números, consultar recursos, filtrar la biblioteca, alternar semanas y configurar una sesión mediante Reactive Forms.
- Validación del nombre de sesión (obligatorio, no solo espacios, máximo 60 caracteres) y duración de 5 a 60 minutos.
- Los datos del perfil, las métricas y los recursos son ficticios. El recordatorio es simulado; no se envían notificaciones. No hay vídeo real ni autenticación.
- El estado solo existe en memoria y se reinicia al recargar. No se implementan ni alteran reglas de ordenación SSP.
- Ilustraciones SVG locales, sin descarga de imágenes o tipografías de terceros.
- Se utiliza texto oscuro sobre el naranja de acción para mantener el contraste, foco visible, etiquetas de formulario y mensajes accesibles de resultado/error.

### Ejecución local con Node 26

Desde la carpeta `ssp-mockup`:

```powershell
npm install
npm run start
```

La aplicación se sirve en `http://localhost:4200` de forma predeterminada. Si el puerto está ocupado, usar `npm run start -- --port 4201` sin detener otros servidores.

Validaciones: `npm run build` y `npm test -- --watch=false`. La compilación se genera en `ssp-mockup/dist/ssp-mockup/browser`.

## 5. Aplicación principal en la raíz

- La aplicación principal reside en la raíz del proyecto, con código en `src` y configuración propia de Angular y npm.
- `ssp-lesson-4`, `ssp-lesson-5` y `ssp-mockup` no forman parte de la aplicación: no se importan ni se incluyen en la compilación, las pruebas o la detección de clases de Tailwind.
- Home tipo landing disponible en `/`, sin barra lateral, con título visible y de navegador **StackSSP** y subtítulo «Entrenamiento para la ordenación SSP.».
- Estructura de la home en cuatro secciones:
  - **Cabecera principal (Hero):** marca **StackSSP**, subtítulo, texto de apoyo orientado a magos y acción principal «Iniciar el Curso» (o «Continuar curso» junto con indicador de progreso si existe avance guardado en cookies).
  - **Beneficios:** tres bloques («Cálculo sencillo, no memoria bruta», «Localización al instante» y «Magia de alto impacto»).
  - **Práctica:** bloque «Entrenamiento paso a paso».
  - **Llamado a la acción final:** mensaje con referencia al inicio en el 9 de Picas y acción «Empezar el Curso» (o «Continuar curso» si hay progreso guardado).
- En el cuerpo de la home no se incluyen ilustraciones de cartas, perfiles ni métricas ficticias.
- **Pie de página común:** presente en todas las vistas de la aplicación, con la marca **StackSSP**, la versión actual de la aplicación leída desde `package.json`, el año actual junto con la mención de autoría y derechos de **Tonio Velayos**, y enlaces rápidos de navegación a **Inicio** (`/`) y al **Curso** (apuntando a la pantalla guardada en progreso o a `/curso/introduccion`).
- Diseño plano basado en [design.md](design.md): fondo claro, tarjetas blancas con bordes sutiles, azul pizarra, naranja de acción con texto oscuro de alto contraste y tonos secundarios suaves. Adaptable a móvil y escritorio, con foco visible y etiquetado accesible.
- Componentes standalone y rutas con carga diferida. Sin backend, imágenes ni fuentes externas.

### Progreso del curso mediante cookies

- La aplicación estructura el aprendizaje como un curso progresivo compuesto por una **Introducción** inicial (`introduccion`) seguida de lecciones numeradas (`leccion-1`, etc.).
- El avance del usuario se guarda en cookies locales del navegador (`ssp_current_lesson` para el módulo en el que se quedó y `ssp_completed_lessons` para los módulos completados).
- La ruta `/curso` redirige automáticamente a la pantalla guardada en la cookie o, en ausencia de progreso previo, a `/curso/introduccion`.
- Si el navegador bloquea las cookies, la aplicación mantiene el estado en memoria durante la sesión y muestra un aviso informativo sin interrumpir el uso.

### Introducción (`/curso/introduccion`)

- Cabecera limpia de curso con enlace a la portada (`/`), referencia a **Introducción** e indicador de estado («En progreso» / «Introducción completada»).
- Introducción en texto al concepto y las propiedades de la ordenación SSP conforme a [leccion0.md](../leccion0.md) y [ordenacion-ssp.md](../ordenacion-ssp.md).
- Simulador interactivo de construcción visual mediante **52 puntos dispuestos en círculo**:
  - Cada carta se representa como un punto coloreado según su palo mediante una paleta diferenciada de **4 colores** (negro para Picas, rojo para Corazones, verde para Tréboles y azul para Diamantes) acompañada de iconografía vectorial plana.
  - El reparto comienza situando el **As de Picas** arriba (las 12 del reloj) y distribuye los cuatro palos según el procedimiento pedagógico de [leccion0.md](../leccion0.md), señalando dónde recae la posición 1 y el cierre en la posición 52 de acuerdo con [ordenacion-ssp.md](../ordenacion-ssp.md).
  - Controles de reproducción/pausa, avance y retroceso carta a carta, salto rápido por palo, vaciado/completado directo y ajuste de velocidad.
  - Al pulsar, tocar en móvil o navegar con teclado sobre cualquiera de los 52 puntos, un visor central (con botones de punto anterior y siguiente para facilitar el uso táctil en pantallas pequeñas) muestra qué carta ocupa ese punto y su posición en la ordenación SSP.
- Cierre teórico preparando el paso a la **Lección 1** (ordenación en las manos), botón para marcar la **Introducción** como completada y enlace directo a `/curso/leccion-1`.

### Lección 1 (`/curso/leccion-1`)

- Cabecera de curso con enlace a la portada (`/`), acceso rápido a **Introducción** (`/curso/introduccion`), referencia a **Lección 1** e indicador de progreso por pasos / lección completada.
- Guía práctica e interactiva en 4 pasos pensada para seguirse con una **baraja física de 52 cartas en las manos**, conforme a [leccion1.md](../leccion1.md) y [ordenacion-ssp.md](../ordenacion-ssp.md):
  1. **Preparación previa por palos:** instrucciones y esquema visual de los 4 paquetes cara arriba (de Rey en el fondo a As visible arriba) apilados de abajo arriba según [leccion1.md](../leccion1.md), con comprobación física rápida.
  2. **División en 3 montones:** guía por referencias visuales (sin necesidad de contar cartas) para formar sobre la mesa los tres montones cara arriba y verificar sus tres cartas superiores visibles conforme a [leccion1.md](../leccion1.md).
  3. **Recogida alternada («uno, dos, tres…»):** entrenador interactivo en vivo que muestra el estado de los 3 montones en la mesa, la carta visible en la mano receptora y la tira de cartas entrelazadas, con controles de ritmo automático ajustable, avance/retroceso carta a carta, avance por tríos («1-2-3»), reinicio y saltos de comprobación hasta voltear el mazo dorso arriba.
  4. **Verificación física y propiedad cíclica:** explicación del carácter cíclico (cortes completos ilimitados sin alterar la secuencia) y comprobador interactivo donde el usuario selecciona cualquier carta vista al cortar su baraja física para verificar las 6 cartas siguientes según [ordenacion-ssp.md](../ordenacion-ssp.md).
- Cierre con adelanto de la siguiente lección (deducción de la carta siguiente al cortar por cualquier posición), botón para marcar la **Lección 1** como completada y navegación a **Lección 2**, **Introducción** e **Inicio**.

### Lección 2 (`/curso/leccion-2`)

- Cabecera de curso con enlace a la portada (`/`), acceso rápido a **Lección 1** (`/curso/leccion-1`), referencia a **Lección 2** e indicador de estado («En progreso» / «Lección 2 completada»).
- Explicación pedagógica del cálculo del **siguiente índice** conforme a [leccion2.md](../leccion2.md) y [ordenacion-ssp.md](../ordenacion-ssp.md):
  - Equivalencia numérica de los 13 índices (`A` a `K`).
  - Desglose comparativo del caso general y de la gestión de valores bajos sin duplicar ni contradecir la definición normativa de [ordenacion-ssp.md](../ordenacion-ssp.md).
  - Explorador interactivo del ciclo de 13 índices donde al pulsar cualquier índice se muestra la operación aplicada y el índice resultante.
- **Entrenador del siguiente índice:**
  - Muestra aleatoriamente uno de los 13 índices (`A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K`) para que el usuario pulse cuál es el índice siguiente.
  - Si falla, incrementa el **contador de fallos**, señala el error con una pista de la regla y permite volver a intentarlo sobre el mismo índice; si acierta, incrementa el **contador de aciertos**, confirma el cálculo aplicado y pasa automáticamente a un nuevo índice aleatorio distinto.
  - Botón **Resetear contador** para poner a cero los contadores de aciertos y fallos en cualquier momento.
- Cierre con adelanto de la **Lección 3** (funcionamiento y secuencia de los palos), botón para marcar la **Lección 2** como completada y navegación a **Lección 3**, **Lección 1** e **Inicio**.

### Lección 3 (`/curso/leccion-3`)

- Cabecera de curso con enlace a la portada (`/`), acceso rápido a **Lección 2** (`/curso/leccion-2`), referencia a **Lección 3** e indicador de estado («En progreso» / «Lección 3 completada»).
- Explicación pedagógica de la secuencia canónica de los palos conforme a [leccion3.md](../leccion3.md) y [ordenacion-ssp.md](../ordenacion-ssp.md), sin duplicar ni contradecir la definición normativa:
  - Presentación del ciclo continuo de los cuatro palos con su numeración y color en baraja.
  - **Representación gráfica interactiva de puntas y sobresalientes por palo:** ilustraciones vectoriales SVG locales para cada uno de los 4 palos con marcadores numerados, líneas guía y opción para ocultar/mostrar marcadores, señalando visualmente dónde están la punta o partes sobresalientes de cada figura (1 en Picas, 2 en Corazones, 3 en Tréboles y 4 en Diamantes/Rombos), junto con ficha activa del palo seleccionado, su siguiente palo y su palo gemelo.
  - Recursos mnemotécnicos verbales (*«picotridia»*, *«picotudo»*, siglas en inglés *S·H·C·D*) y justificación del uso del orden estándar en los vídeos y herramientas de la plataforma.
- **Entrenador del orden de los palos:**
  - Tres modos de práctica intercambiables: siguiente palo en el ciclo, identificación por número de puntas/sobresalientes (`1–4`) y saltos combinados en el ciclo (`+1` y `+2`).
  - Contadores de **aciertos**, **fallos** y porcentaje de precisión, pistas contextuales al fallar manteniendo la pregunta activa, avance automático a una pregunta distinta al acertar y botón **Resetear contador**.
- Cierre preparando la unión de índices y palos en la siguiente lección, botón para marcar la **Lección 3** como completada y navegación a **Lección 4**, **Lección 2** e **Inicio**.

### Lección 4 (`/curso/leccion-4`)

- Cabecera de curso con enlace a la portada (`/`), acceso rápido a **Lección 3** (`/curso/leccion-3`), referencia a **Lección 4** e indicador de estado («En progreso» / «Lección 4 completada»).
- Explicación pedagógica de la integración de índice y palo para deducir la **carta siguiente exacta** conforme a [leccion4.md](../leccion4.md) y [ordenacion-ssp.md](../ordenacion-ssp.md), sin duplicar ni contradecir la definición normativa:
  - Comparativa visual entre la progresión general y la excepción del **«salto de palo»** en los valores bajos (destacando el cambio de color frente al salto al palo gemelo del mismo color).
  - Recorrido de ejemplo desde la carta inicial de referencia y comprobador interactivo donde al seleccionar cualquier carta se desglosan simultáneamente el cálculo del índice y la transición del palo.
- **Entrenador de ciclo completo (52 cartas):**
  - Desordena internamente las 52 cartas de la baraja para presentarlas una a una sin repeticiones ni omisiones a lo largo de un ciclo completo (`1 / 52` a `52 / 52`).
  - Mientras el cronómetro no está en marcha (al entrar, al resetear o al pausar), la carta permanece oculta tras una **interrogación (`?`)** y la selección de índice y palo queda deshabilitada; al pulsar sobre la interrogación o sobre el botón **Play** del cronómetro se inicia/reanuda el tiempo, se revela la carta y se habilita la respuesta (y al pausar vuelve a ocultarse).
  - Con la carta visible solicita seleccionar qué **índice** (`A` a `K`) y qué **palo** (`Picas`, `Corazones`, `Tréboles` o `Diamantes`) corresponden a la carta siguiente, admitiendo la selección en cualquier orden.
  - Incluye **cronómetro de tiempo** (con parada automática al completar la carta 52), **contador de aciertos**, **contador de fallos**, porcentaje de precisión y barra de progreso del ciclo.
  - Si falla, incrementa el contador de fallos, ofrece una pista contextual indicando qué parte falló y mantiene la misma carta activa para reintentar; si acierta, incrementa los aciertos, muestra el cálculo aplicado y pasa a la siguiente carta de la mezcla hasta mostrar el resumen final del ciclo al llegar a 52 aciertos.
  - Botón **Resetear ciclo** para poner a cero tiempo, aciertos y fallos, volver a ocultar la carta y mezclar de nuevo internamente las 52 cartas.
- Cierre destacando la ventaja mágica de los cortes ilimitados y adelantando la **Lección 5** (localización exacta de cualquier carta), botón para marcar la **Lección 4** como completada y navegación a **Lección 3** e **Inicio**.

### Ejecución desde la raíz

```powershell
npm install
npm run start
```

La home se sirve en `http://localhost:4200/` de forma predeterminada. Validaciones: `npm run build` y `npm test -- --watch=false`. Salida de producción: `dist/ssp/browser`.

### Funcionalidades futuras pendientes de definir

- Objetivo de uso y público destinatario.
- Funcionalidades de entrenamiento más allá de la home informativa.
- Pantallas, navegación e interacciones adicionales.
- Datos de entrada, resultados y validaciones.
- Necesidades de persistencia y funcionamiento sin conexión.
- Criterios de aceptación de cada funcionalidad.

Estos puntos no implican funcionalidades aprobadas; se concretarán antes de su implementación.

## 6. Mantenimiento de la documentación

- Actualizar este documento cuando cambien los requisitos, funcionalidades o arquitectura de la aplicación.
- Las definición de la ordenación [ordenacion-ssp.md](../ordenacion-ssp.md) no se cambia.
- Mantener ambos documentos coherentes sin duplicar las reglas del dominio.
