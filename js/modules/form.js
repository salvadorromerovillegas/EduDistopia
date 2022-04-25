/*
* Módulo con métodos concretos para manipular formularios.
*/

import '/js/jquery-3.6.0.min.js';

/**
 * Método interno accesorio que permite seleccionar en un select 
 * un valor de los que contiene.
 * @param {object} select objeto JQuery del select donde se seleccionará el valor
 * @param {string} valor Valor a seleccionar (string)
 * @returns Retorna true si se selecciono el valor o false en caso contrario.
 */
export function seleccionarPorValorSelect(select,valor)
{
    //Deselecionamos todos los options de cada CE.
    select.find('option').attr('selected',false);
    //Buscamos aquellos options cuyo valor sea la nota esperada
    let t=select.find('option:contains("'+valor+'")');    
    for (let e of t) //Para cada opción de las que contiene el valor esperado
    {
        //Seleccionamos la opción que coincide exactamente con la nota.                
        if ($(e).text()===""+valor)
        {
            $(e).attr('selected',true);                        
            return true;
        }                               
    }
    return false;
}