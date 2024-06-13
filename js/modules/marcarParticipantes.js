/**
 * Conjunto de funciones para facilitar el marcado de nombres en un listado de participantes de moodle
 */

import '/js/jquery-3.6.0.min.js';
import '/js/jquery-ui/jquery-ui.min.js';
import { genRandomID } from '/js/modules/u.js';
import { whenAvaliable} from '/js/modules/dyn.js';
import { inyectarEstilo } from '/js/modules/ui/inyectarEstilos.js';

/**
 * Abre la UI para que el usuario introduzca la lista de nombres y apellidos de participantes
 */
export function openPondSFLMarcar() {
    inyectarEstilo('/js/jquery-ui/jquery-ui.min.css');
    if($('div.userlist').length>0) {
      setTimeout(()=>dialog.dialog('open'),100);
    } 
    else
    {
        alert("No se ha encontrado lista de participantes. Acceda a la sección de participantes.");
    }
}

function marcarPos(nombres)
{

    if (typeof nombres==='string')
    {
        nombres=nombres.split('\n');        
    }

    nombres=nombres.map((str) => str.trim());
    nombres=nombres.filter((str) => str.length>0);

    let filas=$('table#participants tbody tr');
    for (let fila of filas) {
        let textoFila=$(fila).text();
        for (let n in nombres)
        { 
            if (textoFila.includes(nombres[n]))
            {
                $(fila).find('input[type="checkbox"]').prop('checked', true);            
                nombres.splice(n,1);   
            }
        }
        if (nombres.length===0) break;
    }

}

function extraeAlumnos()
{
    let alumnos=[];
    let filas=$('table#participants tbody tr th a');
    for (let fila of filas) {
        alumnos.push($(fila).text().trim())                
    }
    return alumnos;
}

//Parte random de cada ID
const rID = genRandomID();
//Id del textarea del dialog
const textareaID = `FPADEXTND_SFL_${rID}`;
//Id del botón del dialog
const submitID = `FPADEXTND_SFL_${rID}`;

//Dialog para mostrar insertar una lista de nombres para marcar
const dialogHTML = `
<div id="dialog-form" title="Marcar seleccionados">
    <P> Introduce una lista de nombres y apellidos separados por salto de línea para marcarlos de la lista</P>
    <div>
          <form action="" onSubmit="return false;">
            <textarea id="${textareaID}" style="width: 700px;height: 200px;"></textarea><br>
          </form>
    </div>    
</div>
`;

//Elemento jquery-ui del dialog
const dialog = $(dialogHTML).dialog({
  autoOpen: false,
  height: 400,
  width: 750,
  modal: true,
  buttons: {
    Cancelar: function () {
      dialog.dialog("close");
    },
    Proceder: function (e)
    {
        let list=dialog.find(`#${textareaID}`).val();
        marcarPos(list);
        dialog.dialog("close");
    }
  }
});