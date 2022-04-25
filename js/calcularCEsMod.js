import {collectCRs, collectCEs, mapCRsToCEs, checkAllCEsHaveCRsMapped,gradeCEs,asignarNotasCEs,obtenerNotaAsignadaActual,copyGradeToAllCEs} from '/js/modules/ext.js';

export function procesarCEsNotaDistribuida ()
{
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

    let CEs = collectCEs();

    if (CEs.size==0) {
        alert("No se han detectado criterios de evaluación en la página.");
        return;
    }

    let errors=[];
    if (mapCRsToCEs(CRs, CEs, errors)) {
      if (checkAllCEsHaveCRsMapped(CEs,errors)) {
        let nmCEs = gradeCEs(CEs,errors);
        if (nmCEs !== false) {
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

export function procesarCEsCopyNote ()
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