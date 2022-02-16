/**
 * Módulo extractor de CR y CE de la página de corrección de la tarea por rúbrica.
 */

import '/js/jquery-3.6.0.min.js';

/**
     * Busca todos los criterios de rúbrica (CR) y los retorna en un array de  objetos. Cada
     * entrada del objeto tiene lo siguiente:
     *
     *   - text: texto descriptor del CR
     *   - CEs: array con todos los CEs del criterio (si siguen el formato esperado)
     *   - logro: texto del nivel de logro conseguido
     *   - porcentaje: porcentaje de peso de este CR en el global de CRs (de la puntuación máxima)
     *   - score: Puntuación obtenida en este CR sobre scoreMax
     *   - scoreMax: Puntuación máxima de este CR
     *   - score10: Puntuación de este CR sobre 10 (siendo 10 scoreMax)
     *   - scoreGlobalPart: Aportación a la nota global de este CR (si se suman todos se obtiene la nota final de la tarea sobre 10)
     *   - feedback: Texto de retroalimentación
     * 
     * Además, el array retornado tiene el siguiente método/función añadido:
     * 
     *   - calculateGrade(): método que calcula la nota sobre 10 de los criterios de rúbrica.
     * 
     * @returns array con la información de criterios de rúbrica o un número
     * negativo en caso de error:
     * -1 No se encuentra la tabla de criterios
     * -2 No están rellenos todos los criterios.
     */
    export function collectCRs () {
      //Obtenemos todos las filas de cada CR
      let criterias = $('tr.criterion').filter('[id^=advancedgrading-criteria]');
      //Si no hay criterios, salimos, estamos en una página errónea.
      if (criterias.length == 0) {
        return -1;
      }
      //Aquí almacenamos los criterios
      let criteriaList = [];
      //Suma de todos la máxima puntuación de cada criterio
      let scoreMaxSum = 0;
      //Todos los criterios se han relleno, a priori, si... luego ya veremos.
      let allCriteriaScoreMarked = true;
  
      for (let i of criterias) {
        //Texto del criterio de rúbrica
        let criteriaText = $(i).find('.description').text();
        //Extraemos los CEs de la descripción de cada CR.
        let raEx = /[( ,]RA([0-9]+\.\w)+[), ]/g;
        let criteriaCEs = [];
        let tmpA;
        do {
          tmpA = raEx.exec(criteriaText);
          if (tmpA) criteriaCEs.push(tmpA[1]);
        } while (tmpA);
        //Nivel de logro marcado (texto)
        let criteriaLogro = $(i).find('.levels td.level.checked div.definition').text().trim();
        //Nivel de logro marcado (puntuación)
        let criteriaScore = $(i).find('.levels td.level.checked div.score').text().replace('puntos', '').trim();
        
        //Nivel de logro máximo (puntuación)
          //Cálculo anterior (supone que el último es el máximo)
            //let criteriaScoreMax = $(i).find('.levels td.level div.score:last').text().replace('puntos', '').trim();
          //Cálculo nuevo 14/01/2022 (busca el máximo de todos los scores considerando que pueden no estar ordenados)
            let criteriaScoreMax=$.map($(i).find('.levels td.level div.score'),
                function(node) {        
                  return parseFloat($(node).text().replace('puntos', '').trim());
                }).reduce((a,b)=>Math.max(a,b));

        //Comentario del profesor para este nivel de logro
        let criteriaVal = $(i).find('.remark textarea').val().replace(/\n/g, '<br>');
  
        //Si este CR no se ha marcado... no seguimos.
        allCriteriaScoreMarked = allCriteriaScoreMarked && criteriaScore;
        if (!allCriteriaScoreMarked) {
          return -2;
        }
  
        criteriaList.push({
          text: criteriaText,
          CEs: criteriaCEs,
          logro: criteriaLogro,
          score: parseFloat(criteriaScore),
          scoreMax: parseFloat(criteriaScoreMax),
          feedback: criteriaVal
        });
        scoreMaxSum += parseFloat(criteriaScoreMax);
  
      }
      //Calculamos porcentaje score10 y scoreGlobalPart
      for (let ci of criteriaList) {
        ci.porcentaje = ci.scoreMax * 100 / scoreMaxSum;
        ci.score10 = ci.score * 10 / ci.scoreMax;
        ci.scoreGlobalPart = ci.score10 * ci.porcentaje / 100;
      }
  
      criteriaList.calculateGrade=function () {
        let grade = 0;
        for (let cr of this) {
            grade += cr.score10 * cr.porcentaje;
        }
        grade=grade/100;
        return grade;
      };

      return criteriaList;
    }

    /**
     * Retorna un mapa donde la llave es el CE (2.a,4.b, etc.) y el contenido
     * es un objeto con:
     * - ce: texto de definición del CE
     * - ceSel: objeto JQuery con el select para poner la nota del CE mapeado.
     * - currGrade : la nota marcada en el CE o null si no la hay marcada.
     * - cr: array vacío para almacenar en un futuro los CRs asociados a este CE.
     * @returns mapa con todos los CE encontrados.
     */
    export function collectCEs () {
      const ceMap = new Map();
      const ceOutcomes=$("[id^=fitem_menuoutcome]");
      if (ceOutcomes.length==0) {
        return ceMap;
      }  
      let $dCE;
      for ($dCE of ceOutcomes) {
        //Obtenemos el texto de cada CE
        let ceDEF = $($dCE).find('label').text().trim();
        if (/^\d+\.\w+\).*/.test(ceDEF)) {
          //Extraemos el número de CE
          let ceNUM = ceDEF.split(')')[0];
          //Obtenemos el select 
          let ceSel = $($dCE).find('select').filter('[name^=outcome]');
          if (ceSel.length != 1) {
            alert("ERROR 13: Formulario origen alterado (select), hay que reprogramarlo, esta extensión ya no sirve.");
            console.log("ERROR 13: Formulario origen alterado (select), hay que reprogramarlo, esta extensión ya no sirve.");
            break;
          }
          //Obtenemos el valor seleccionado ahora
          let currGrade=ceSel.find('option:selected').text();
          currGrade = /^[0-9]+(\.[0-9]+)?$/gm.test(currGrade) ? parseFloat(currGrade) : null;
          ceMap.set(ceNUM,
            {
              ce: ceDEF,
              ceSel: ceSel,
              currGrade: currGrade,
              cr: []
            });
        }
        else {
          alert("ERROR 12: Formulario origen alterado (label), hay que reprogramarlo, esta extensión ya no sirve.");
          console.log("ERROR 12: Formulario origen alterado (label), hay que reprogramarlo, esta extensión ya no sirve.");
          break;
        }
      }
      return ceMap;
    }

   /**
   * Mapea los CRs a los CEs de los que participa.
   * Este es un paso importante, donde se asocia cada CE a los CR para poder calcular la nota de cada CE.
   * Esto modifica cada CE añadiendo los CR que participa (array ce.cr)
   * @param CRs Array con todos los CR (obtenido con collectCRs)
   * @param CEs Mapa de CEs (obtenido con collectCEs)
   * @param errors Array donde se irán añadiendo los errores que se van encontrando al realizar el mapeado.
   * @returns true si se ha podido hacer todo los mapeos y false en caso contrario.
   * 
   */
  export function mapCRsToCEs (CRs, CEs, errors = []) {
    let ok = true;
    for (let cr of CRs) {
      for (let cetxt of cr.CEs) {
        let ce = CEs.get(cetxt);
        if (ce) {
          ce.cr.push(cr);
        }
        else {
          errors.push("Error de mapeado: el criterio de evaluación "+ cetxt +" aparece en algún criterio de rúbrica, pero no está entre el listado de criterios de evaluación de esta tarea.");
          console.log("Mapping CE to CR: " + cetxt + " not found");
          ok = false;
        }
      }
    }
    return ok;
  }

  /**
   * Comprueba que todos los CEs tienen al menos un CR mapeado.
   * Nota: antes hay que invocar a mapCRsToCEs para que haga el mapeado.
   * @param CEs mapa de CEs
   * @param errors array que contendrá las detecciones de falta de mapeado
   * @returns true si todos están mapeados y false si no lo están
   */
   export function checkAllCEsHaveCRsMapped (CEs, errors = []) {
    for (const [cedef, ce] of CEs) {
      if (ce.cr.length == 0) {
        errors.push("El criterio de evaluación " + cedef + " no aparece en ningún criterio de rúbrica y no se podrá calcular su nota.");
        console.log(cedef + " no tiene asociados CRs");
        return false;
      }
      else {
        console.log(cedef + " tiene " + ce.cr.length + "CRs")
      }
    }
    return true;
  }

  /** Redondea nota siguiendo formato de select.
   *  @param grade Nota numérica. 
   *  @returs Nota redondeada.
  */
  export function roundGrade (grade) { return Math.round(grade * 10) / 10; }
  
  /**
   * Realiza el cálculo de la nota de cada CE en base a los CR que 
   * tiene mapeados.
   * Nota: antes de invocar este método hay que hacer el mapeado con mapCRsToCEs.
   * Modifica el mapa CEs añadiendo el atributo "grade" con la nota de ese criterio de evaluación.
   * @param {*} CEs 
   * @returns false si no se pudo hacer el cálculo de la nota de cada CE
   * o la nota media de todos los CEs si se pudo realizar el cálculo.
   */
  export function gradeCEs (CEs,errors=[]) {
    if (checkAllCEsHaveCRsMapped(CEs,errors)) {
      //Si cada CE tiene al menos un CR.
      let gSUM = 0;
      for (const [cedef, ce] of CEs) {
        let g = 0;
        let p = 0;
        for (let cr of ce.cr) {
          g += cr.score10 * cr.porcentaje;
          p += cr.porcentaje;
        }
        g = g / p;
        if (g > 10.4 || g < 0) //permitimos hasta 10.4 para errores de precisión
        {
          errors.push("ERROR INTERNO: nota CE superior a 10, esto no debería haber pasado... ¿qué ha fallado? No lo sé.")
          console.log("ERROR INTERNO: esto no debería haber pasado.")          
          return false;
        }
        g = Math.min(10, g); //Prevemos errores de precisión.
        ce.grade = roundGrade(g);
        gSUM += g;
      }
      return roundGrade(gSUM / CEs.size);
    }
    else {
      return false;
    }
  }

/** 
 * Copia la misma nota a todos los CEs
 * @param {*} CEs Mapa con los CE a calificar
 * @param grade nota a asignar a cada CE (float)
  */
export function copyGradeToAllCEs (CEs, grade)
{
  for (const [cedef, ce] of CEs) {
    ce.grade=roundGrade(grade);
  }
}

/**
 * Selecciona en el "<SELECT>" correspondiente la nota de cada CE.
 * Antes de invocar este proceso hay que invocar elmétodo gradeCEs para calcula la nota de cada CE.
 * @param {*} CEs Mapa con los CE ya calificados.
 * @param {*} errors Array opcinal para recopilar posibles errores
 * @returns true si todo ha ido bien o false en caso de que algún CE no se haya podido asignar.
 */
  export function asignarNotasCEs (CEs, errors=[])
  {
      let ok=true;
     //Recorremos todos los CEs.     
     for(const [key,value] of CEs)
     {
         //Deselecionamos todos los options de cada CE.
         value.ceSel.find('option').attr('selected',false);
         //Buscamos aquellos options cuyo valor sea la nota esperada
         let t=value.ceSel.find('option:contains("'+value.grade+'")');
         //check
         let selected=false;
         for (let e of t)
         {
             //Seleccionamos la opción que coincide exactamente con la nota.                
             if ($(e).text()===""+value.grade)
             {
                 $(e).attr('selected',true);
                 console.log(key+" CE asignada nota "+value.grade);
                 selected=true;
                 break;
             }                              
         }
         if (!selected)
         {
           ok=false;
           errors.push("No se ha podido seleccionar la nota "+value.grade+" para el criterio de evaluación "+ key);
         }
     }
     return ok;
  }

  /**
   * Función que obtiene la nota asignada actual a la tarea
   * @returns la nota (si aparece) o -1 si no hay nota o -2 si en esta página no aparece currentgrade (de las tareas), esto quiere decir que no es una página de tareas.
   */
export function obtenerNotaAsignadaActual() {
  //Buscamos el elemento currentgrade que aparece en las tareas
  let nota=-1;
  let t = $('span.currentgrade');  
  if (t.length) {
    //Si aparece comprobamos su valor:
    let m = t.text().replace(',', '.').trim();
    if (m.match(/^[0-9]+(?:\.[0-9]+)?$/)) { //Si es un número con decimales
      nota = parseFloat(m);
    }    
  }
  else {
      nota=-2;
  }
  return nota;
}