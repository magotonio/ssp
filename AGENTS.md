# Instrucciones para el agente

## Contexto
- Stack de la aplicación raíz: Angular 22 (aprobado para Node 26), TypeScript estricto, Tailwind CSS v4, si fuera necesario para el backend: PHP 8.2 y MariaDB.
- La aplicación principal está en la raíz, con código en `src`. `ssp-lesson-4`, `ssp-lesson-5` y `ssp-mockup` son independientes y no forman parte de ella; el mockup es solo una referencia visual.
- Consulta [ESPECIFICACIONES.md](docs/spec/ESPECIFICACIONES.md) antes de modificar funcionalidades o arquitectura, y [ordenacion-ssp.md](docs/ordenacion-ssp.md) antes de modificar reglas de la ordenación SSP.
- Si las especificaciones y el código se contradicen, señala la discrepancia antes de cambiar el comportamiento.

## Forma de trabajar
- Responde en español, de forma clara y concisa.
- Examina la implementación existente antes de proponer o aplicar cambios.
- Realiza cambios acotados al objetivo; evita refactorizaciones no solicitadas.
- Reutiliza componentes, servicios y utilidades existentes.
- No sobrescribas modificaciones del usuario.
- Consulta antes de introducir dependencias, cambiar la arquitectura o realizar operaciones destructivas.

## Frontend
- Utiliza componentes standalone y el control de flujo moderno de Angular: `@if`, `@else` y `@for`.
- Mantén los patrones existentes de Signals y RxJS.
- Usa Reactive Forms para los formularios y servicios para la comunicación HTTP.
- Define contratos mediante interfaces TypeScript; evita `any` y conversiones de tipos que oculten errores.
- Utiliza Tailwind CSS v4 y reutiliza los estilos y variables existentes.
- No introduzcas configuraciones o directivas propias de Tailwind v3.
- Conserva el diseño responsive, los textos en español y el formato regional `es`.
- Mantén la accesibilidad: etiquetas, navegación por teclado, gestión del foco y atributos ARIA cuando correspondan.
- Contempla estados de carga, error y ausencia de datos.

## Validación
- Ejecuta las comprobaciones pertinentes al cambio y comunica sus resultados.
- Para cambios del frontend, utiliza `npm run build`.
- Ejecuta las pruebas relevantes cuando existan.
- No abras el navegador ni ejecutes automatizaciones de navegador salvo petición expresa.
- El usuario mantiene `npm run start` activo con hot reload y comprueba la interfaz directamente; no inicies otro servidor.
- Indica claramente cualquier comprobación que no hayas podido realizar.

## Documentación y entrega
- Actualiza [ESPECIFICACIONES.md](docs/spec/ESPECIFICACIONES.md) cuando cambien funcionalidades, endpoints o estructura de la aplicación, y [ordenacion-ssp.md](docs/ordenacion-ssp.md) cuando cambien las reglas de la ordenación SSP. No dupliques estas reglas en las especificaciones de la aplicación.
- No crees documentación adicional salvo que se solicite.
- Al terminar, resume los cambios, las validaciones realizadas y cualquier limitación pendiente.

