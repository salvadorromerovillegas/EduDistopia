# Historial de cambios

## Futuras versiones

 - TODO: Inyectar un botón para invocar copiarNotaTareaActualACriteriosEvaluacion.
 - TODO: actualizar el estilo del cajón de utilidades.
 - TODO: crear generador de botones
 - TODO: convertir a botones tipo "<A>" para evitar invocar autosave-ajax.php 1->1, 1->N, CR->CE, Calcular y Insertar Feedback.
 - TODO: añadir dialog de ayuda a "1->1", "1->N" y "CR->CE"
 - TODO: los estilos de botón tipo "<A>" centralizarlos en hojas de estilo base.
 

## Versión 1.0.4

- Se añade utilidad para marcar participantes (se modifica cajonutilidades y se añade j/s/modules/marcarParticipantes.js).
- Se ha movido promedioCEs.js y generarFeedbackMod.js a modules, se han documentado y se han renombrado (promedioCEs.js --> popupInfoNotaCECR.js)
- Se renombro "ask.\*" por "cajonutilidades.\*" (popup con opciones que está desfasado)
- Se separa injectable.js en dos: injectableUtilidadesNotas.js y injectableGuardarFormularios.js. 
- Se cambia el nombre de correomejoras.js a injectableMejorasCorreo.js.
- Añadido /js/modules/ayudacorregirrapido.js con funciones para facilitar la corrección ( marcar como correcto o no realizado el item de rúbrica). Añadir la función de marcar "criterio de rúbrica" como correcto y que añade el texto "Correcto." al cuadro de retroalimentación.
- Se evita recarga de jquery-ui.css.
- Se añaden facilidades para edición de correo.

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