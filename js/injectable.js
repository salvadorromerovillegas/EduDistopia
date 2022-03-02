
import '/js/jquery-3.6.0.min.js';

import { whenAvaliable, whenNotAvaliable } from './modules/dyn.js';
import { collectForm, fillForm, genRandomID, getUserInfo} from '/js/modules/u.js';
import { roundGrade } from './modules/ext.js';
import { renderFeedback } from '/js/generarFeedbackMod.js';

let rID = genRandomID();

/**
 * Inyecta el toolbar para las operaciones de guardar y rescatar
 */
export function inject() {

    let randomId = 'FPADEX_TOOLBAR_'+rID;
    if ($('#' + randomId).length == 0) {
        $('body').append("<div id='" + randomId + "'></div>");
        $('#' + randomId).load(chrome.runtime.getURL('/htmlfragments/toolbar.html'));
        console.log("Injected Toolbar");
        $(document).on('click', '#' + randomId + ' #FPDEX_Save',
            function (e) {
                let data = [];
                let studentData=getUserInfo();
                let momento=new Date();
                data.unshift({formData:collectForm('form.gradeform'),
                            date:momento,
                            student:getUserInfo()});
                let fechastr=momento.toLocaleDateString()+" "+momento.toTimeString();
                chrome.storage.local.set({ assignmentData: data });
                if (studentData)
                {
                    alert ("Datos guardados de "+studentData.name + " a las " + fechastr);
                }
                else
                {
                    alert ("Datos guardados a las "+ fechastr)
                }
            }
        );
        $(document).on('click', '#' + randomId + ' #FPDEX_Rescue', function (e) {
            chrome.storage.local.get('assignmentData').then(
                function (data) {
                    let assignmentData=data.assignmentData[0];
                    let studentData=assignmentData.student;                    
                    let momento=new Date((Date)(assignmentData.date));
                    let fechastr=momento.toLocaleDateString()+" "+momento.toTimeString();
                    let mustDoIt=false;
                    if (studentData)
                    {
                        mustDoIt=confirm ("Reestablecer datos guardados de \""+studentData.name + "\" a las " + fechastr);
                    }
                    else
                    {
                        mustDoIt=confirm ("Reestablecer datos guardados a las "+fechastr);
                    }
                    if (mustDoIt)
                        fillForm('form.gradeform', assignmentData.formData); 
                },
                function (error) { alert('No se pudo recuperar') }
            );
        });
    }

    //Insertamos cuando esté disponible los botones extra y el estilo
    whenAvaliable('form[data-region=grading-actions-form]').then(
        (elm) => {

            //Estilo
            let formsty = chrome.runtime.getURL('/css/formstyles.css');
            $('head').append(`<link rel="stylesheet" href="${formsty}" type="text/css" />`);

            //Botón insertar feedback
            let btnID = 'FPADEX_INSERTAR_FEEDBACK_' + rID;
            if (!document.getElementById(btnID)) {

                let b = $('<button class="btn btn-info" style="font-size:9px">Insertar<br>Feedback</button>');
                b.attr('id', btnID);
                $(elm).append(b);
                b.click(renderFeedback);
            }

        }
    );
}

/**
 * Convierte un texto dado en un número con decimales considerando que los
 * decimales pueden ir por coma o punto.
 * @param {string} t texto que contiene la nota (número con decimales)
 * @returns null si no se pudo convertir o el número si se pud hacer la conversión.
 */
//TODO: mover este método a un módulo de "conversión de datos de entrada"
function procesarNota(t)
{
    let nota=null;
    let m = t.replace(',', '.').trim();
    if (m.match(/^[0-9]+(?:\.[0-9]+)?$/)) { //Si es un número con decimales
      nota = parseFloat(m);
    } 
    return nota;
}

/**
 * Método interno accesorio que permite seleccionar en un select 
 * un valor de los que contiene.
 * @param {object} select objeto JQuery del select donde se seleccionará el valor
 * @param {string} valor Valor a seleccionar (string)
 * @returns Retorna true si se selecciono el valor o false en caso contrario.
 */
//TODO: mover este método a un módulo de "manipulación de formularios"
function seleccionarPorValorSelect(select,valor)
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

/**
 * Método que inyecta la sección para bombear las notas desde caja de texto a
 * los desplegables (tanto en CEs como en RAs)
 */
export function injectRAPump() {
    whenAvaliable('form.gradeform.mform fieldset').then(
        function (elm) {
            let f = true;
            if ($('[id^=fitem_menuoutcome_].fitem .felement button').length == 0) {
                let $calificadores = $('[id^=fitem_menuoutcome_].fitem');
                for (let fitem of $calificadores) {
                    let select_id = $(fitem).find('select').attr('id');
                    let input_id = 'ED' + select_id;
                    $(fitem).find('.felement').append(`<input style='margin-left:10px' class='form-control' id='${input_id}' data-ref-edudist='${select_id}' value=''>`);
                    if (f) {
                        let button1 = $("<button style='margin-left:10px' class='btn btn-primary'>1 -> N</button>");
                        //Pulsar el botón 1 -> N
                        button1.click(function () {
                            let inputs = $("[data-ref-edudist][data-ref-edudist!='']");
                            let nota=null;
                            if (inputs.length>0)
                            {
                                nota=procesarNota($(inputs[0]).val());
                                if (nota!==null && nota<=10 && nota>=0)
                                {
                                    nota=roundGrade(nota);                                    
                                    for (let input of inputs) {
                                        seleccionarPorValorSelect($('#' + $(input).attr('data-ref-edudist')),nota);
                                    }
                                }
                                else 
                                {
                                    alert("Valor de nota no esperado.");
                                }
                            }
                        });
                        let button2 = $("<button style='margin-left:10px' class='btn btn-primary' id='ED_103OOPRRA133B'>1 -> 1</button>");
                        button2.click(function () {
                            let inputs = $("[data-ref-edudist][data-ref-edudist!='']");
                            let nota=null;
                            if (inputs.length>0)
                            {
                                let k=1;
                                for (let input of inputs) {
                                    nota=procesarNota($(input).val());
                                    if (nota!==null && nota<=10 && nota>=0)
                                    {
                                        nota=roundGrade(nota);                                                            
                                        seleccionarPorValorSelect($('#' + $(input).attr('data-ref-edudist')),nota);                                    
                                    }
                                    else 
                                    {
                                        alert("Valor de nota para el elemento "+k+" no esperado.");
                                    }
                                    k++;
                                }
                            }
                        });
                        $(fitem).find('.felement').append(button1);
                        $(fitem).find('.felement').append(button2);
                        f = false;
                    }
                }
                /* Si el elemento DOM desaparece, volvemos a esperar a que aparezca */
                whenNotAvaliable('form.gradeform.mform fieldset').then(
                    function () {
                        injectRAPump();
                    }
                )
            }
        });
}