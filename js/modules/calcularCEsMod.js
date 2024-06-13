import {collectCRs, collectCEs, mapCRsToCEs, checkAllCEsHaveCRsMapped,gradeCEs,
        asignarNotasCEs,obtenerNotaAsignadaActual,copyGradeToAllCEs} from '/js/modules/ext.js';

/**
 * Función que marca en cada CE la nota en base a los CR en los que participa,
 * ponderando en base a la nota máxima de cada CR.
 */
export function procesarCEsNotaDistribuida ()
{
    //Recogemos los criterios de rúbrica y la información textual de ellos
    let CRs = collectCRs();
    
    if (CRs===-1)
    {
        alert("No se encuentran los criterios en la página actual.");
        return;
    }
    
    if (CRs===-2)
    {
        alert("No están todos los criterios de rúbrica rellenos y no se puede calcular la nota para cada criterio de evaluación.");
        return;
    }

    //Recojemos los desplegables con los CEs
    let CEs = collectCEs();

    if (CEs.size==0) {
        alert("No se han detectado criterios de evaluación en la página.");
        return;
    }

    let errors=[];
    //Asociamos a cada CE aquellos CR que participa
    if (mapCRsToCEs(CRs, CEs, errors)) {
      //Comprueba que todos los CEs tengan al menos un CR mapeado
      if (checkAllCEsHaveCRsMapped(CEs,errors)) {
        /*Calcula la nota de cada CE en base al promedio de los CR en los que participa. */
        let nmCEs = gradeCEs(CEs,errors);
        if (nmCEs !== false) {
            /* Una vez calculadas la notas de cada CE en base a los CR de los que participa,
               modifica los desplegables de cada CE para poner la nota. */
            let ok=asignarNotasCEs(CEs,errors);
            if (ok) {
                alert("Notas por CE procesadas.\n Nota media para CEs: " + nmCEs);        
            }
            else {
                alert("No se ha podido asignar la calificación.\n\n"+errors.join('\n'));
            }
        }
        else {
          alert("No se pudo calcular nota CEs.\n\n"+errors.join('\n'));
        }
      }
      else {
        alert("Hay criterios de evaluación que no tiene asignados criterios en la rúbrica, no es posible hacer el cálculo.\n\n"+errors.join('\n'));
      }
    }
    else {
      alert("Hay criterios de la rúbrica que tienen asociados criterios de evaluación que no aparecen.\n\n"+errors.join('\n'));
    }
}

/**
 * Simplemente copia la nota de la tarea a todos los CEs.
 * La nota puede haber sido rellenada "a mano" si no se ha configurado Rúbrica.
 * Si no hay nota actual de la tarea, entonces calcula la que obtendría en base a los CRs marcados.
 */
export function copiarNotaTareaActualACriteriosEvaluacion ()
{
    //Otenemos la nota asignada a la tarea
    let nota=obtenerNotaAsignadaActual();

    if (nota==-2)
    {
      //Si la nota es -2 es porque no aparece la nota en la página, luego no es una tarea.
      alert ("No se ha detectado que estés en una página donde haya una tarea. ¿Es una tarea?");
      return;
    }
    else if (nota==-1)
    {
      //Si la nota es -1, es que no se ha guardado y se procede a calculal desde de los CRs.
      alert ("No se ha calificado la tarea, se procede a calcular la nota desde los Criterios de Rúbrica.");
      let CRs = collectCRs();
      if (CRs===-1)
      {      
        alert("Error: no se encuentran los criterios en la página actual.");
        return;
      }    
      if (CRs===-2)
      {
        alert("No están todos los criterios de rúbrica rellenos y no se puede calcular la nota para cada criterio de evaluación.");
        return;
      }
      nota=CRs.gradeBasedOnCRs;      
    }
    else
    {
      alert ("Tarea ya calificada. Se usa la nota actual de la tarea:"+nota);
    }

    let CEs = collectCEs();

    copyGradeToAllCEs(CEs, nota);

    let errors=[];
    let ok=asignarNotasCEs(CEs,errors);
    if (ok) {
        alert("Notas por CE procesadas.\n Nota media para CEs: " + nota);        
    }
    else {
        alert("No se ha podido asignar la calificación.\n\n"+errors.join('\n'));
    }
}