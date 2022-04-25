/*
* Módulo con métodos que permite detectar cambios en el árbol DOM.
* Este módulo está pensado para código que se actualiza dinámicamente vía JavaScript,
* donde elementos dom aparecen y desaparecen.
* Hay un método para detectar cuando un elemento DOM aparece y otro 
* para detectar cuando un elemento DOM desaparece.
*/

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

/**
 * Espera a que un elemento desaparezca del árbol DOM o de una rama del mismo
 * @param {string} selector CSS query del elemento a observar (si hay varios solo se observará el primero)
 *            (se busca con querySelector)
 * @param {HTMLElement} nodo Elemento DOM a observar donde está el elemento que se espera que cambie (por defecto document.body).
 * @param {integer} waitFor Tiempo en milisegundos que esperará. Pasado ese tiempo, se emite un rechazo en la promesa.
 * Puede ser null (en tal caso, se espera por siempre).
 * @returns Una promesa. Cuando la promesa se resuelve cuando el elemento desaparece.
 */
 export function whenNotAvaliable (selector, nodo = document.body, waitFor = null) {
    return new Promise((resolve,reject) => {

        let elemento=document.querySelector(selector);
        if (!elemento) //Elemento será null si no se encuentra
        {
            //Si el elemento no existe, simplemente resolvemos el promise
            resolve();
        }
        else{
            //Si el elemento existe, observamos mutaciones del documento
            const observer = new MutationObserver(mutations => {
                //Al producirse una mutación, volvemos a buscar el elemento 
                let elemento=document.querySelector(selector);
                if (!elemento) {
                    //Si el elemento NO existe, resolvemos y desconectamos observer.
                    resolve();
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

/**
 * Llama a la función pasada por parámetro cuando el atributo (attribute) de los elementos obtenidos con el selector
 * cambia de valor.
 * @param {string} selector CSS query de los elementos a observar 
 * @param {string} attribute Atributo cuya modificación hará que se invoque la función callback.
 * @param {function} callback función a invocar cuando un nodo donde el atributo indicado se modifica.
 * La función callback puede tener 3 parámetros opcionales: target (nodo), nombre del atributo, valor anterior.
 * Si la funcion callback retorna true, se detiene la observación.
 */
 export function ifAttributeChanged (selector, attribute, callback) {
  
    const elements=document.querySelectorAll(selector);
    for (let element of elements )
    {
        const observer= new MutationObserver(mrecords=>
            {
                for (let mrecord of mrecords) {
                     if (mrecord.attributeName==attribute 
                         && callback(mrecord.target, mrecord.attributeName, mrecord.oldValue))
                        observer.disconnect();   
                }
            });
        observer.observe(element,{
            attributes: true
        });
    }  
}