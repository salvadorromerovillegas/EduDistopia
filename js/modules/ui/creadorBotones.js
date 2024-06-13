import '/js/jquery-3.6.0.min.js';

const estiloBoton = "padding: 2px 9px;margin-left: 10px; color:white !important";

export class Boton {

    #boton;    

    constructor (texto)
    {
        let x=document.createElement('template');        
        x.innerHTML=`<a class="btn btn-primary btn-sm" style="${estiloBoton}" href="javascript:void(0)" role="button">${texto}</a>`;                
        this.#boton=document.importNode(x.content,true);   
    }

    set title(title)
    {
        this.#boton.querySelector('A').setAttribute('title',title);
    }

    set id(id)
    {
        this.#boton.querySelector('A').setAttribute('id',id);
    }

    set accion(accion)
    {        
        let element=this.#boton.querySelector('A');
        if (element===null) {
            console.log("Problema!");
            console.log(this.#boton);
            return;
        }
        element.addEventListener("click",function (e) {
            setTimeout(()=>accion(e),1);
            e.stopPropagation();
        },true);
    }

    get boton() {
        return this.#boton;
    }
}