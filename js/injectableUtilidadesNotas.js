
import '/js/jquery-3.6.0.min.js';
import '/js/jquery-ui/jquery-ui.min.js';

import { whenAvaliable, whenNotAvaliable } from './modules/dyn.js';
import { genRandomID } from '/js/modules/u.js';
import { roundGrade, collectCRs, calcCEMark } from './modules/ext.js';
import { renderFeedback } from '/js/modules/generarFeedbackMod.js';
import { procesarCEsNotaDistribuida } from '/js/modules/calcularCEsMod.js';
import { seleccionarPorValorSelect } from '/js/modules/form.js';
import { creaSeccionNotaCEPond } from '/js/modules/cepond.js';
import { notificar } from '/js/modules/toolbar.js';
import { addBotonMarcarComoCorrecto } from '/js/modules/ayudacorregirrapido.js';
import { inyectarEstilo } from '/js/modules/ui/inyectarEstilos.js';
import { Boton } from '/js/modules/ui/creadorBotones.js';



chrome.storage.sync.get(null, (items) => console.log(items));
//logging stored items
chrome.storage.local.get(null, (items) => console.log(items));

const rID = genRandomID();

/**
 * Método inyecta la sección para bombear las notas desde caja de texto a
 * los desplegables (tanto en CEs como en RAs)
 */
export function inject() {

    //Insertamos estilos cuando esté disponible y no estén previamente inyectados
    whenAvaliable('form[data-region=grading-actions-form]').then(
        (elm) => {
            inyectarEstilo("/css/formstyles.css");
        }
    );

    //Injectamos los botones 1->1 y 1->N
    whenAvaliable('form.gradeform.mform fieldset').then(
        function (elm) {

            //Verificamos el "data-..." insertado para saber si ya se insertaron o no los botones y las cajas de texto.
            if (document.getElementById('id_gradeheadercontainer').getAttribute('data-FPADEX-mejoras')!=="insertado") {
                let f = true;
                let $calificadores = $('[id^=fitem_menuoutcome_].fitem');
                for (let fitem of $calificadores) {
                    let select_id = $(fitem).find('select').attr('id');
                    let input_id = 'ED' + select_id;
                    $(fitem).find('.felement').append(`<input style='margin-left:10px' class='form-control' id='${input_id}' data-ref-edudist='${select_id}' value=''>`);                    
                    if (f) {
                        
                        let button1N=new Boton('1 -> N');
                        button1N.titulo="Haz click para copiar la nota de esta primera caja de texto a todos los desplegables (del primero a todos)."
                        button1N.accion=distribuirNotasDeUnoATodos;

                        let button11=new Boton('1 -> 1');
                        button11.titulo="Haz click para copiar la nota de cada caja de texto a cada desplegable (uno a uno)";
                        button11.accion=distribuirNotasUnoAUno;
                        
                        $(fitem).find(".felement").append(button1N.boton);
                        $(fitem).find('.felement').append(button11.boton);                        
                        if (collectCRs() !== -1) {
                            let buttonCR2CE = new Boton('CR -> CE');
                            buttonCR2CE.titulo="Distribuye uniformemente la nota de los CR entre los CE en base a los CEs indicados para cada CR.";
                            buttonCR2CE.accion=procesarCEsNotaDistribuida;                            
                            $(fitem).find('.felement').append(buttonCR2CE.boton);
                        }
                        f = false;
                    }
                }
                /* Si el elemento DOM desaparece, volvemos a esperar a que aparezca */
                whenNotAvaliable('form.gradeform.mform fieldset').then(
                    function () {
                        inject();
                    }
                );
                //Añadimos marca para saber si se ha insertado o no las cajas de texto y los botones 1-N
                document.getElementById('id_gradeheadercontainer').setAttribute('data-FPADEX-mejoras','insertado');
            
            //Insertamos el botón marcar como correcto (una vez)
            addBotonMarcarComoCorrecto();
            //Insertamos sección nota CRs provisional
            creaSeccionNotaCRsProv();
            //Insertamos sección nota CEs provisional
            creaSeccionNotaCEsProv();
            //Insertamos botón de generar feedback
            creaBotonAddFeedback();
            //Insertamos sección nota CE ponderada
            creaSeccionNotaCEPond();
            }
        });
}

/**
 * Copia la nota de la primera caja a todos los desplegables.
 * Admite notas separadas por coma.
 */
function distribuirNotasDeUnoATodos()
{
    let inputs = $("[data-ref-edudist][data-ref-edudist!='']");
    let nota = null;
    if (inputs.length > 0) {
        nota = procesarNota($(inputs[0]).val());
        if (nota !== null && Array.isArray(nota)) //Múltiples valores
        {
            if (inputs.length != nota.length) {
                alert("El número de notas insertado no coincide con el número de elementos.");
            }
            else {
                let lastSelect = null;
                let counter = 0;
                for (let input of inputs) {
                    let pnota = roundGrade(nota[counter]);
                    counter++;
                    let sel = $('#' + $(input).attr('data-ref-edudist'));
                    seleccionarPorValorSelect(sel, pnota);
                    lastSelect = sel;
                }
                if (lastSelect) lastSelect.change();
            }
        }
        else if (nota !== null && nota <= 10 && nota >= 0) //Valor escalar
        {
            nota = roundGrade(nota);
            let lastSelect = null;
            for (let input of inputs) {
                let sel = $('#' + $(input).attr('data-ref-edudist'));
                seleccionarPorValorSelect(sel, nota);
                lastSelect = sel;
            }
            if (lastSelect) lastSelect.change();
        }
        else {
            alert("Valor de nota no esperado.");
        }
    }
}

function distribuirNotasUnoAUno()
{
    let inputs = $("[data-ref-edudist][data-ref-edudist!='']");
    let nota = null;
    if (inputs.length > 0) {
        let k = 1;
        for (let input of inputs) {
            nota = procesarNota($(input).val());
            if (nota !== null && !Array.isArray(nota) && nota <= 10 && nota >= 0) {
                nota = roundGrade(nota);
                let sel = $('#' + $(input).attr('data-ref-edudist'));
                seleccionarPorValorSelect(sel, nota);
                sel.change();
            }
            else {
                alert("Valor de nota para el elemento " + k + " no esperado.");
            }
            k++;
        }
    }
}

/**
 * Convierte un texto dado en un número con decimales considerando que los
 * decimales pueden ir por coma o punto.
 * @param {string} t texto que contiene la nota (número con decimales)
 * @returns null si no se pudo convertir o el número si se pudo hacer la conversión o un array si en la cadena hay varios números separados por espacios, punto y coma o guión.
 */
//TODO: mover este método a un módulo de "conversión de datos de entrada"
function procesarNota(t) {
    let nota = null;
    let m = t.replaceAll(',', '.').trim();
    if (m.match(/^([0-9]+(?:\.[0-9]+)?)(?:[ ;-]([0-9]+(?:\.[0-9]+)?))*$/g)) { //Si es un número con decimales
        let parts = m.split(/[ ;-]+/);
        if (parts.length === 1)
            nota = parseFloat(parts[0]);
        else {
            nota = [];
            for (const part of parts) {
                nota.push(parseFloat(part));
            }
        }
    }
    return nota;
}


/**
 * Si aparece la sección para rellenar la nota por CRs entonces añade una sección para mostrar
 * el cálculo provisional de la nota de los CRs y configura los eventos necesarios para que
 * se actualice.
 */
function creaSeccionNotaCRsProv() {
    let randomId = "FPEXTD_nota_CRs_prov" + rID;
    if ($("tr.criterion td.level").length > 0 && $("span#" + randomId).length == 0) {
        $(`<div class="form-group row fitem fpadextei">
                <div class="col-sm-5"><span class="float-sm-right text-nowrap"></span>                
                <span class="col-form-label d-inline-block ">
                    Calificación calculada del libro de calificaciones (según <abbr title="Criterios de rúbrica">CRs</abbr>):
                </span>                    
                </div>
                    <div class="col-sm-7 form-inline felement" data-fieldtype="static">
                    <div class="form-control-static">
                        <span id="${randomId}">-</span> (Nota orientativa <b>no mostrada al alumnado</b>) 
                    </div>
                    <div class="form-control-feedback invalid-feedback" id="">                        
                    </div>
                </div>
                </div>`).insertBefore("div#fitem_id_currentgrade");

        let calcularNotaProvCR = () => {
            let notaProvisionalBasadaEnCR = roundGrade(collectCRs(true).gradeBasedOnCRs, 2);
            notificar(`Nota provisional basada en criterios de rúbrica: ${notaProvisionalBasadaEnCR}`, 1);
            $("span#" + randomId).html(notaProvisionalBasadaEnCR);
        };
        setTimeout(calcularNotaProvCR, 500);
        //Lanzamos la actualización de la nota provisional CRs 1 segundo después del mouseup
        $("tr.criterion td.level").click(
            function () {
                setTimeout(calcularNotaProvCR, 500);
            }
        );

        $("span#" + randomId).html(roundGrade(collectCRs(true).gradeBasedOnCRs));
    }
}

/**
 * Si aparece la sección para poner las notas de cada CE entonces añade una sección para mostrar
 * el cálculo provisional de la nota de los CEs y configura para que se actualice.
 */
function creaSeccionNotaCEsProv() {
    let randomId = "FPEXTD_nota_CEs_prov" + rID;
    if ($('[id^=fitem_menuoutcome_].fitem select').length > 0 && $("span#" + randomId).length == 0) {
        $(`<div class="form-group row fitem fpadextei">
            <div class="col-sm-5"><span class="float-sm-right text-nowrap"></span>                
                <span class="col-form-label d-inline-block " alt="Media aritmética (no ponderada) de la nota de los criterios de evaluación">
                    Media ARITMÉTICA de la nota de los criterios de evaluación:
                </span>                    
            </div>
            <div class="col-sm-7 form-inline felement" data-fieldtype="static">
            <div class="form-control-static">
                <span id="${randomId}">-</span> (Nota orientativa <b>no mostrada al alumnado</b>)

            </div>
            <div class="form-control-feedback invalid-feedback" id="">                        
            </div>
        </div>
        </div>`).insertBefore("div#fitem_id_currentgrade");

        let calcularNotaProvCE = function () {
            let ceMark = calcCEMark(true);
            if (ceMark >= 0) {
                $("span#" + randomId).html(ceMark);
                notificar("Nota prov. media aritmética CE: " + ceMark, 2);
            }
            else {
                $("span#" + randomId).html('[No disponible]');
                notificar("", 2);
            }
        }
        $('[id^=fitem_menuoutcome_].fitem select').on('change', calcularNotaProvCE);
        setTimeout(calcularNotaProvCE, 500);
    }
}

/**
 * Añade el botón de añadir feedback justo encima de la sección de feedback.
 */
function creaBotonAddFeedback() {
    //Botón insertar feedback
    let btnID = 'FPADEX_INSERTAR_FEEDBACK_' + rID;
    //Si no existe lo insertamos
    if (!document.getElementById(btnID)) {
        let b=new Boton("Insertar Feedback");
        b.accion=renderFeedback;
        b.title="Genera el feedback desde la rúbrica de moodle y lo inserta en la retroalimentación.";        
        b.id=btnID;
        $("div#fitem_id_assignfeedbackcomments_editor label").append(b.boton);     
    }
}

let dialogHTML = `
<div id="dialog-form" title="Selecciona copia de seguridad">
  <div>
    
  </div>
</div>
`;