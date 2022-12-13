import '/js/jquery-3.6.0.min.js';
import { genRandomID } from '/js/modules/u.js';


/**
 * Injecta la barra del toolbar en el elemento jquery dado vía "append" 
 */
export function appendToolbarTo (jqueryItem)
{
    if (typeof jqueryItem.append === 'function' ) jqueryItem.append(toolbar);
    else 
    {
        console.log ("Se ha intertado añadir el toolbar pero no se ha podido.",jqueryItem);
    }
}

/**
 * Obtiene la altura del toolbar
 */
export function toolbarHeight (jqueryItem)
{
    return toolbar.height();
}

/**
 * Establece el manejador del botón guardar
 */
export function setSaveFormButtonHandler (handlerfunction)
{
    if (typeof handlerfunction==='function')
    {
        saveFormButton.click(handlerfunction);
    }
    else
    {
        console.log("Se ha pasado como argumento a la función setSaveFormButtonHandler un valor no válido (distinto a una función)",handlerfunction);
    }
}

/**
 * Establece el manejador del botón rescatar
 */
export function setRescueFormButtonHandler (handlerfunction)
{
    if (typeof handlerfunction==='function')
    {
        rescueFormButton.click(handlerfunction);
    }
    else
    {
        console.log("Se ha pasado como argumento a la función setRescueFormButtonHandler un valor no válido (distinto a una función)",handlerfunction);
    }
}

export function notificar(notificacion, espacio=4)
{
    switch (espacio)
    {
        case 1: notifArea1.html(notificacion); break;
        case 2: notifArea2.html(notificacion); break;
        case 3: notifArea3.html(notificacion); break;
        default: alert (notificacion); break;
    }
}


//Parte random de cada ID
const rID=genRandomID();

//Id del área de notificación
const toolbarID=`FPADEXTND_TB_${rID}`;
//Id del área de notificación 1
const notifAreaID1=`FPADEXTND_TBNA1_${rID}`;
//Id del área de notificación 2
const notifAreaID2=`FPADEXTND_TBNA2_${rID}`;
//Id del área de notificación 3
const notifAreaID3=`FPADEXTND_TBNA3_${rID}`;
//Id del botón de guardar formulario
const saveFormButtonID=`FPADEXTND_TBSS_${rID}`;
//Id del botón de rescatar formulario
const rescueFormButtonID=`FPADEXTND_TBRS_${rID}`;

const toolbarhtml=`
<div class="row" id="${toolbarID}" style="height:33px;">
    <div class="col-md-12 fpadextndtb">
    <div class="float-left notificationarea" id="${notifAreaID1}" >            
    </div>
    <div class="float-left notificationarea" id="${notifAreaID2}" >            
    </div>
    <div class="float-left notificationarea" id="${notifAreaID3}" >            
    </div>
    <div class="float-right">
            <strong>¿Falla la sesión?</strong>
            <button id="${saveFormButtonID}" class="btn-xs btn-primary" title="Guarda el formulario completo al almacenamiento interno del navegador">Guardar</button>
            <button id="${rescueFormButtonID}" class="btn-xs btn-primary" title="Restablece el formulario completo desde una copia existente en el almacenamiento interno del navegador">Rescatar</button>
        </div>
    </div>
</div>`;

//Elementos jquery 
const toolbar=$(toolbarhtml);
const notifArea1=toolbar.find(`#${notifAreaID1}`);
const notifArea2=toolbar.find(`#${notifAreaID2}`);
const notifArea3=toolbar.find(`#${notifAreaID3}`);
const saveFormButton=toolbar.find(`#${saveFormButtonID}`);
const rescueFormButton=toolbar.find(`#${rescueFormButtonID}`);
