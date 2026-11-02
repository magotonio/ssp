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
  - **Cabecera principal (Hero):** marca **StackSSP**, subtítulo, texto de apoyo orientado a magos y botón de acción «Iniciar el Curso».
  - **Beneficios:** tres bloques («Cálculo sencillo, no memoria bruta», «Localización al instante» y «Magia de alto impacto»).
  - **Práctica:** bloque «Entrenamiento paso a paso».
  - **Llamado a la acción final:** mensaje con referencia al inicio en el 9 de Picas y botón «Empezar el Curso».
- Los botones de acción de la home permanecen sin navegación activa hasta definir las pantallas correspondientes. No se incluyen ilustraciones de cartas, menciones de autoría, perfiles ni métricas ficticias.
- Diseño plano basado en [design.md](design.md): fondo claro, tarjetas blancas con bordes sutiles, azul pizarra, naranja de acción con texto oscuro de alto contraste y tonos secundarios suaves. Adaptable a móvil y escritorio, con foco visible y etiquetado accesible.
- Componentes standalone y ruta home con carga diferida. Sin backend, persistencia, imágenes ni fuentes externas.

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
