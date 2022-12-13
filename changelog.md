# Historial de cambios
## Versión 1.0.3

- Corregido problema cuando no aparece los CRs y se inyecta el calculo de CR provisional.
- Mejorado algunos aspectos a la hora de guardar o rescatar.
- Agregado cálculo ponderado de CEs e interfaz para asociar la ponderación de CEs a cada tarea.
- Mejoras generales en la interfaz.

## Versión 1.0.2
- Se ha añadido _locale/es/messajes.json para ir adaptando los mensajes 
- Se ha añadido el botón "CR -> CE" para generar más cómodamente las notas de los CE con cálculo distribuido.
- Se ha modificado el método ext.js/collectCRs, añadiendole un argumento, para permitir que extraiga los CRs aunuqe no haya sido rellenados.
- Se ha creado el método ext.js/calcCEMark que permite calcular la nota en función de los CEs aunque estén incompletos.
- Se ha creado el método dyn.js/ifAttributeChanged que permite ejecutar un método si un atributo de un nodo cambia de valor.
- Se ha creado el método injectable.js/creaSeccionNotaCRsProv que crea un area para el cálculo dinámico de la nota basada en CRs provisional.
- Se ha creado el método injectable.js/creaSeccionNotaCEsProv que crea un area para el cálculo dinámico de la nota basada en CEs provisional.
- Se ha modificado para que también injecte la nota en TinyMCE, o la copie al clipboard en caso de que no esté ni Atto ni TinyMCE.
- Se ha modificado la plantilla de feedback.
- El texto del comentario de cada CR ahora se procesan las entidades HTML para evitar que se renderice el HTML.
- La funcionalidad de guardar/rescatar se ha mejorado, incluyendo un historial de guardado.

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