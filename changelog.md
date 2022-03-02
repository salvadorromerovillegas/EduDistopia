# Historial de cambios

## Versión 1.0.1
- Se ha modificado el funcionamiento de "Guardar/Rescatar" para que funcione con el código inyectado por RAPump
- Añadido el método whenNotAvailable que permite detectar cuando un elemento DOM desaparece.
- Modificado injectable.js/injectRAPump para detectar cuando se cambia de página y volver a inyectar el RAPump
- Se ha movido whenNotAvailable y whenAvailable al módulo dyn.js
- Optimización del código en ext.js que extrae la información de los CRs (collectCRs) y otros puntos donde se usa su información.

## Versión 1.0 - Versión inicial
Tiene:
- RA/CE Pump
- Feedback generator
- Modificador de estilo CSS de rúbrica automático
- Calculadora de notas de CE en base a CRs
- Calculadora según CEs y CRs
- Copiadora de notas