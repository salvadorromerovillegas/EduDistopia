
import '/js/jquery-3.6.0.min.js';
import { genRandomID } from '/js/modules/u.js';

const rID = genRandomID();

/**
* Función que inyecta un estilo en la hoja de cálculo
* @param estilo_filename Archivo con el estilo a iyectar (indicar ruta absoluta desde raíz del proyecto)
*/
export function inyectarEstilo (estilo_filename)
{    
    let t="forms_styles_injected_"+rID+"_"+btoa(estilo_filename);
    try
    {
        if (!$("body").data(t)) {
            let formsty = chrome.runtime.getURL(estilo_filename);
            $('head').append(`<link rel="stylesheet" href="${formsty}" type="text/css" />`);
            $("body").data(t,true);
        }
    }
    catch(error)
    {
        console.log(e);
        alert(error);
    }
}