import '/js/jquery-3.6.0.min.js';

/**
 * Genera un ID aleatorio
 * @param {int} length longitud del id en carácteres (por defecto 64 carácteres)
 * @returns El id generado.
 */
export function genRandomID(length=64)
{
    const DIGS="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let ret="";
    for (;length>0;length--) ret+=DIGS[Math.floor((Math.random()*DIGS.length))];
    return ret;
}

/**
* Obtiene la información de usuario descrita en la página.
* Se retorna un objeto con los siguientes elementos:
* - userid = ID de usuario
* - assignmentid = ID de la tarea
* - name = nombre y apellidos
* @return null en caso de que no se encuentre la información o un objeto en caso de encontrarla.
*/
export function getUserInfo()
{
    let data=null;
    let r=$('div [data-region=user-info]');
    if (r.length>0)
    {
        data={};
        data.userid=r.attr('data-userid');
        data.assignmentid=r.attr('data-assignmentid');
        let t=r.find('a').clone();
        t.find('em').remove();
        t.find('img').remove();
        data.name=t.text().trim();
    }
    return data;
}

/**
 * Obtiene una copia en memoria de los datos de un formulario (normales y algunos de role)
 * 
 * Retorna un array con cada uno de los elementos del formulario (text, radio, checkbox, textarea y select)
 * por "name" (debe ser único), y luego además, busca todos los elementos con "role=radio" 
 * y "role=textbox" editables. 
 * Nota: falta con role=checkbox (se hará en un futuro.) 
 * Cada elemento del array contiene un objeto (e) con las siguientes propiedades:
 * - e.id = id del elemento (puede ser undefined, si no tiene id)
 * - e.name = name del elemento (puede ser undefined, lo es para role=radio y role=textbox)
 * - e.type = tipo del elemento (TEXT|RADIO|CHECKBOX|TEXTAREA|SELECT|ROLE_RADIO|ROLE_TEXTBOX)
 * - e.value = valor del elemento (para checkbox y radio es simplemente 'checked' o vacío, para ROLE_RADIO es el valor de 'aria-checked',
 * para el resto, su texto)
 * @param formSelector Selector del formulario
 * @returns Array con los elementos extraidos
 */
export function collectForm(formSelector) {
    let formsItems = [];
    let form=$(formSelector);
    //Obtiene del formulario todos los inputs no hidden normales
    for (let i of form.find('input:not([type=hidden]):not([type=file]),textarea,select')) {
        let e = {};
        e.id = $(i).attr('id');
        e.name = $(i).attr('name');
        switch (i.tagName) {
            case 'INPUT':
                
                e.type = $(i).attr('type');
                if (e.type) e.type=e.type.trim().toUpperCase();
                else e.type="TEXT";

                switch (e.type) {
                    case "CHECKBOX":
                    case "RADIO":
                        e.value = $(i).attr('checked');
                        console.log(e.value);
                        break;
                    default:
                        e.value = $(i).val();
                        break;
                }
                break;
            case 'TEXTAREA':                
            case 'SELECT':
                e.type = i.tagName;
                e.value = $(i).val();
                break;
        }
        formsItems.push(e);
    }
    //Elementos con el rol de radio
    for (let i of form.find(':not(input)[role=radio]'))
    {
        let e={};
        e.type='ROLE_RADIO';
        e.id = $(i).attr('id');
        e.value = $(i).attr('aria-checked');
        formsItems.push(e);
    }
    //Elementos con el rol de textbox
    for (let i of form.find(':not(input)[role=textbox][contenteditable=true]'))
    {
        let e={};
        e.type='ROLE_TEXTBOX';
        e.id = $(i).attr('id');
        e.value = $(i).html();
        formsItems.push(e);
    }
    return formsItems;
}

/**
 * Rellena un formulario con datos recogidos con collectForm.
 * @param {*} formSelector Selector CSS del formulario
 * @param {*} formData Datos del formulario formatedos tal y como retorna el método collectForm
 */
export function fillForm(formSelector, formData) {
    let form = $(formSelector);
    for (let i of formData) {
        let e = {};
        let selector="";        
        if (i.id) {
            selector+='#'+$.escapeSelector(i.id);
        }
        if (i.name) {
            selector+='[name='+$.escapeSelector(i.name)+']';
        }
        if (!selector) continue; //Si no hay selector, se pasa al siguiente.
        let item;
        switch (i.type) {
            case 'ROLE_RADIO':
                item=form.find(selector);
                if (item && (item.attr('aria-checked')=='false' && i.value=='true' ||
                            item.attr('aria-checked')=='true' && i.value=='false'))
                            {
                                item.click();
                            }
            break;
            case 'ROLE_TEXTBOX':
                 item=form.find(selector);
                 item.html(i.value);
            break;
            case 'RADIO': case 'CHECKBOX':
                form.find('input'+selector).attr('checked', i.value);
                console.log(i.value);
                break;
            case 'TEXTAREA': case 'SELECT':
                form.find(i.type + selector).val(i.value);
                break;
            default:
                form.find('input'+selector).val(i.value);
                break;
        }
    }
}

