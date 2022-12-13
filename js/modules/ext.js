/**
 * Módulo con funciones para extraer los CRs y CES de la página de corrección de la tarea por rúbrica,
 * y también para calcular la nota por CRs a CEs y demás.
 * 
 */

import '/js/jquery-3.6.0.min.js';
import {seleccionarPorValorSelect} from '/js/modules/form.js';

/**
 * Función ACCESORIA
 * Dada una cadena como por ejemplo:
 *  "( RA1.d, RA3.f, ra4.e,RA5.d ) Cosas que pasan"
 * Extrae los CE en un array ([ "1.d" ,"3.f" ,"4.e" , "5.d" ] )
 * Si no los encuentra, retorna un array vacío []
 * Y eso es todo.
 */
function extractorCEdeCadena(text)
{
  let listaCEs = [];
  let e1=/\((\s*(?:RA|ra|CE|ce)\d+\.\w\s*(?:,\s*(?:RA|ra|CE|ce).\.\w\s*)*)\)/g.exec(text);
  if (e1 && e1.length>0)
  {
          let raEx = /([0-9]+\.\w)/g;          
          let tmpA;
          do {
            tmpA = raEx.exec(e1[0]);
            if (tmpA) listaCEs.push(tmpA[1]);
          } while (tmpA);          
  }
  return listaCEs;
}

/**
     * Busca todos los criterios de rúbrica (CR) y los retorna en un array de objetos. Cada
     * entrada del objeto tiene lo siguiente ("criteriaList" sería el array e "i" la posición):
     *
     *   - criteriaList[i].text: texto descriptor del CR
     *   - criteriaList[i].CEs: array con todos los CEs del criterio (si siguen el formato esperado)
     *   - criteriaList[i].logro: texto del nivel de logro conseguido
     *   - criteriaList[i].porcentaje: porcentaje de peso de este CR en el global de CRs (puntuación máxima del CR / suma máximos CR )
     *   - criteriaList[i].score: Puntuación obtenida en este CR sobre scoreMax
     *   - criteriaList[i].scoreMax: Puntuación máxima de este CR
     *   - criteriaList[i].score10: Puntuación de este CR sobre 10 (siendo 10 scoreMax)
     *   - criteriaList[i].scoreGlobalPart: Aportación a la nota global de este CR (si se suman todos se obtiene la nota final de la tarea sobre 10)
     *   - criteriaList[i].feedback: Texto de retroalimentación
     * 
     * Además, el objeto retornado tiene un atributo común:
     * 
     *   - criteriaList.gradeBasedOnCRs : método que calcula la nota sobre 10 de los criterios de rúbrica.
     * 
     * @param consideraCRNoRellenadoComo0 este parámetro determina si se considera como 0 el CR no rellenado.
     * 
     * @returns array con la información de criterios de rúbrica o un número
     * negativo en caso de error:
     * -1 No se encuentra la tabla de criterios
     * -2 No están rellenos todos los criterios (nunca retornará este valor si el parámetro consideraCRNoRellenadoComo0 es true).
     */
    export function collectCRs (consideraCRNoRellenadoComo0 = false) {
      //Obtenemos todos las filas de cada CR
      let criterias = $('tr.criterion').filter('[id^=advancedgrading-criteria]');
      //Si no hay criterios, salimos, estamos en una página si rúbrica.
      if (criterias.length == 0) {
        return -1;
      }
      //Aquí almacenamos los criterios
      let criteriaList = [];
      //Aquí se almacena la suma de las puntuaciones máximas de cada criterio de cada criterio
      let scoreMaxSum = 0;
      //¿Todos los criterios se han relleno? A priori, si... luego ya veremos.
      let allCriteriaScoreMarked = true;
  
      /* Recorremos todos los criterios antes extraídos */
      for (let i of criterias) {
        //Extraemos el texto del criterio de rúbrica
        let criteriaText = $(i).find('.description').text();
        //Extraemos los CEs de la descripción de cada CR.        
        let criteriaCEs=extractorCEdeCadena(criteriaText);        
        //Nivel de logro marcado (el texto)
        let criteriaTextoLogro = $(i).find('.levels td.level.checked div.definition').text().trim();
        if (!criteriaTextoLogro && consideraCRNoRellenadoComo0)
        {
          criteriaTextoLogro = "UNSELECTED";
        }

        //Nivel de logro marcado (la puntuación)
        let criteriaScore = $(i).find('.levels td.level.checked div.score').text().replace('puntos', '').trim();        
        if (!criteriaScore && consideraCRNoRellenadoComo0)
        {
          criteriaScore='0';
        }

        //Nivel de logro máximo (puntuación)          
        //Cálculo: busca el máximo de todos los scores considerando que pueden no estar ordenados.
            let criteriaScoreMax=$.map($(i).find('.levels td.level div.score'),
                function(node) {        
                  return parseFloat($(node).text().replace('puntos', '').trim());
                }).reduce((a,b)=>Math.max(a,b));

        //Comentario del profesor para este nivel de logro
        let criteriaFeedback = $(i).find('.remark textarea').val();
  
        //Si este CR no se ha marcado... no seguimos.
        allCriteriaScoreMarked = allCriteriaScoreMarked && criteriaScore;
        if (!allCriteriaScoreMarked) {
          return -2;
        }
  
        criteriaList.push({
          text: criteriaText,
          CEs: criteriaCEs,
          logro: criteriaTextoLogro,
          score: parseFloat(criteriaScore),
          scoreMax: parseFloat(criteriaScoreMax),
          feedback: criteriaFeedback
        });
        scoreMaxSum += parseFloat(criteriaScoreMax);
  
      }
      //Calculamos porcentaje score10 y scoreGlobalPart
      let gradeBasedOnCRs=0;
      for (let ci of criteriaList) {
        ci.porcentaje = ci.scoreMax * 100 / scoreMaxSum;
        ci.score10 = ci.score * 10 / ci.scoreMax;
        ci.scoreGlobalPart = ci.score10 * ci.porcentaje / 100;    
        gradeBasedOnCRs+=ci.scoreGlobalPart;
      }
  
      //EStablecemos el atributo gradeBasedOnCRs que calcula la nota de la tarea en base a los CRs marcados.
      criteriaList.gradeBasedOnCRs=gradeBasedOnCRs;

      return criteriaList;
    }

    /**
     * Retorna un mapa donde la llave es el CE (2.a,4.b, etc.) y el contenido
     * es un objeto con:
     * - ce: texto de definición del CE
     * - ceSel: objeto JQuery con el select para poner la nota del CE mapeado.
     * - currGrade : la nota marcada en el CE o null si no la hay marcada.
     * - cr: array vacío para almacenar en un futuro los CRs asociados a este CE.
     * @param {boolean} silent En caso de error, no genera mensajes de alerta.
     * @returns mapa con todos los CE encontrados.
     */
    export function collectCEs (silent=false) {
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
            !silent && alert("ERROR 13: Formulario origen alterado (select), hay que reprogramarlo, esta extensión ya no sirve.");
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
          !silent && alert("ERROR 12: Formulario origen alterado (label), hay que reprogramarlo, esta extensión ya no sirve.");
          console.log("ERROR 12: Formulario origen alterado (label), hay que reprogramarlo, esta extensión ya no sirve.");
          break;
        }
      }
      return ceMap;
    }

    /**
     * Calcula la nota basada en los CEs configurados.
     * @param {boolean} ignoreNotSelected si un CE no tiene nota, entonces se ignora.
     * @returns -2 si no hay CEs en la página dada.
     *          -1 si hay algún CE sin marcar (no retornará este valor si ignoreNotSelected es true)
     *           o número decimal con la nota.
     */
    export function calcCEMark(ignoreNotSelected=false)
    {
    //Recogemos los CEs
    let CEs = collectCEs(true);

    //Si el mapa contiene elementos
    if (CEs.size > 0) {
        let medGrade = 0;
        let allCEsGraded = true;
        for (const [key, val] of CEs) {
            if (val.currGrade !== null) {
                medGrade = medGrade + val.currGrade;
            }
            else if (!ignoreNotSelected) {
                allCEsGraded = false;
                break;
            }
        }
        if (allCEsGraded) {
            medGrade = Math.round(medGrade * 100.0 / CEs.size) / 100.0;
            return medGrade;
        }
        else {
            return -1;
        }
    }
    else {
        return -2;
    }
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
  export function roundGrade (grade,dec=1) { 
        let base=Math.pow(10,dec); 
        return Math.round(grade * base) / base; 
      }
  
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
      for (const [cedef, ce] of CEs) { //CEs es un mapa (cedef key y ce valor)
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
 * Antes de invocar este proceso hay que invocar elmétodo gradeCEs para calcular la nota de cada CE.
 * @param {*} CEs Mapa con los CE ya calificados.
 * @param {*} errors Array opcinal para recopilar posibles errores
 * @returns true si todo ha ido bien o false en caso de que algún CE no se haya podido asignar.
 */
  export function asignarNotasCEs (CEs, errors=[])
  {
      let ok=true;
      let lastSelect=null;
     //Recorremos todos los CEs.     
     for(const [key,value] of CEs)
     {
         let selected=seleccionarPorValorSelect(value.ceSel,value.grade);
         lastSelect=value.ceSel;
         if (!selected)
         {
           ok=false;
           errors.push("No se ha podido seleccionar la nota "+value.grade+" para el criterio de evaluación "+ key);
         }
     }
     if (lastSelect) lastSelect.change();
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