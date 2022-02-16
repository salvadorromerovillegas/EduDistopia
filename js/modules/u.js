import '/js/jquery-3.6.0.min.js';

/**
 * Espera a que un elemento del arbol DOM esté disponible
 * @param {string} selector CSS query del elemento a observar (si hay varios solo se observará el primero)
 *            (se busca con querySelector)
 * @param {HTMLElement} nodo Elemento DOM a observar (por defecto document.body).
 * @param {integer} waitFor Tiempo en milisegundos que esperará. Pasado ese tiempo, se emite un rechazo en la promesa.
 * Puede ser null (en tal caso, se espera por siempre).
 * @returns Una promesa. Cuando la promesa se resuelva contendrá el elemento del árbol DOM por el que se espera.
 */
 export function whenAvaliable (selector, nodo = document.body, waitFor = null) {
    return new Promise((resolve,reject) => {

        let elemento=document.querySelector(selector);
        if (elemento)
        {
            //Si el elemento existe ya, simplemente resolvemos el promise
            resolve(elemento);
        }
        else{
            //Si el elemento no existe, observamos mutaciones del documento
            const observer = new MutationObserver(mutations => {
                //Al producirse una mutación, volvemos a buscar el elemento 
                let elemento=document.querySelector(selector);
                if (elemento) {
                    //Si el elemento existe, resolvemos y desconectamos observer.
                    resolve(elemento);
                    observer.disconnect();
                }
            });            

            //Observamos el árbol DOM
            observer.observe(nodo, {
                childList: true,
                subtree: true
            });
            
            //Establecemos el timeout para dejar de observar cambios DOM
            if (Number.isInteger(waitFor) && waitFor>0)
            {
                setInterval(()=>{
                    reject();
                    observer.disconnect();}
                ,waitFor);
            }
        }
    });
}

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
* @return -1 en caso de que no se encuentre la información o un objeto en caso de encontrarla.
*/
export function getUserInfo()
{
    let data={};
    let r=$('div [data-region=user-info]');
    if (r.length>0)
    {
        data.userid=r.attr('data-userid');
        data.assignmentid=r.attr('data-assignmentid');
        let t=r.find('a').clone();
        t.find('em').remove();
        t.find('img').remove();
        data.name=t.text().trim();
    }
    else
    {
        data=-1;
    }
    return data;
}
/**
 * [[NECESITA ACTUALIZARSE DOC]]
 * Obtiene una copia en memoria de los datos de un formulario.
 * Retorna un array con cada uno de los elementos del formulario (text, radio, checkbox, textarea y select)
 * por "name" (debe ser único). Cada elemento del array contiene un objeto (e) con las siguientes propiedades:
 * - e.id = id del elemento (no usado realmente)
 * - e.name = name del elemento
 * - e.value = valor del elemento (para checkbox y radio es simplemente 'checked' o vacío)
 * @param formSelector Selector del formulario
 * @returns Array con los elementos extraidos
 */
export function collectForm(formSelector) {
    let formsItems = [];
    let form=$(formSelector);
    for (let i of form.find('input:not([type=hidden]):not([type=file]),textarea,select')) {
        let e = {};
        e.id = $(i).attr('id');
        e.name = $(i).attr('name');
        switch (i.tagName) {
            case 'INPUT':
                e.type = $(i).attr('type').trim().toUpperCase();
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
 * Rellena un formulario 
 * * [[NECESITA ACTUALIZARSE DOC]]
 * @param {*} formSelector Selector CSS del formulario
 * @param {*} formData Datos del formulario formatedos tal y como retorna el método collectForm
 */
export function fillForm(formSelector, formData) {
    let form = $(formSelector);
    for (let i of formData) {
        let e = {};
        let item;
        switch (i.type) {
            case 'ROLE_RADIO':
                item=form.find('#'+$.escapeSelector(i.id));
                if (item && (item.attr('aria-checked')=='false' && i.value=='true' ||
                            item.attr('aria-checked')=='true' && i.value=='false'))
                            {
                                item.click();
                            }
            break;
            case 'ROLE_TEXTBOX':
                 item=form.find('#'+$.escapeSelector(i.id));
                 item.html(i.value);
            break;
            case 'RADIO': case 'CHECKBOX':
                form.find('input[name=' + $.escapeSelector(i.name) + ']').attr('checked', i.value);
                console.log(i.value);
                break;
            case 'TEXTAREA': case 'SELECT':
                form.find(i.type + '[name=' + $.escapeSelector(i.name) + ']').val(i.value);
                break;
            default:
                form.find('input[name=' + $.escapeSelector(i.name) + ']').val(i.value);
                break;
        }
    }
}

/** CODE WORKING
switch (prompt("action"))
{
    case "save":
        {
            let data=collectForm('form.gradeform');
            data=JSON.stringify(data);
            window.localStorage.setItem('test',data);
        }
    break;
    case "restore":
        {
            let data=window.localStorage.getItem('test');        
            if (data)
            {
                data=JSON.parse(data);
                fillForm('form.gradeform',data);
            }   
        }
        break;
}
*/