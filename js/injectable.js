
import '/js/jquery-3.6.0.min.js';
import '/js/jquery-ui/jquery-ui.min.js';

import { whenAvaliable, whenNotAvaliable,ifAttributeChanged } from './modules/dyn.js';
import { collectForm, fillForm, genRandomID, getUserInfo} from '/js/modules/u.js';
import { roundGrade, collectCRs, calcCEMark } from './modules/ext.js';
import { renderFeedback } from '/js/generarFeedbackMod.js';
import { procesarCEsNotaDistribuida } from '/js/calcularCEsMod.js';
import { seleccionarPorValorSelect } from '/js/modules/form.js';
import { getStoredData } from '/js/modules/localstoragehelpers.js';
import { creaSeccionNotaCEPond } from '/js/modules/cepond.js';
import { appendToolbarTo, toolbarHeight, setSaveFormButtonHandler, setRescueFormButtonHandler, notificar } from '/js/modules/toolbar.js';

chrome.storage.sync.get(null,(items)=>console.log(items));
//logging stored items
chrome.storage.local.get(null,(items)=>console.log(items));


let rID = genRandomID();

/**
 * Inyecta el toolbar para las operaciones de guardar y rescatar, la hoja de estilos para
 * formatear el rubricador y la hoja de estilos de jquery-ui usada para algunos aspectos.
 */
export function inject() {

    let randomId = 'FPADEX_TOOLBAR_'+rID;
    if (!$('div[data-region=grading-navigation-panel] div.container-fluid').attr('data-fpadex-tool')) {
        //Añadimos el toolbar
        appendToolbarTo($('div[data-region=grading-navigation-panel] div.container-fluid'));
        //Ampliamos la altura de la región donde se inserta el toolbar
        let nh=$('.path-mod-assign [data-region="grade-panel"]').first().position().top+toolbarHeight();
        $('.path-mod-assign [data-region="grade-panel"]').css('top',nh+'px');
        //Establecemos el manejador del botón guardar formularios
        setSaveFormButtonHandler(saveForm);
        //Establecemos el manejador del botón guardar formularios
        setRescueFormButtonHandler(rescueForm);
        //Marcamos el div donde hemos insertado el toolbar para que no se vuelva a insertar el toolbar
        $('div[data-region=grading-navigation-panel] div.container-fluid').attr('data-fpadex-tool', true);                              
    }

    //Insertamos cuando esté disponible los botones extra y el estilo
    whenAvaliable('form[data-region=grading-actions-form]').then(
        (elm) => {

            //Estilo
            let formsty = chrome.runtime.getURL('/css/formstyles.css');
            $('head').append(`<link rel="stylesheet" href="${formsty}" type="text/css" />`);            
        }
    );
        
    //Estilo JQuery UI
    let formsty = chrome.runtime.getURL('/js/jquery-ui/jquery-ui.min.css');
    $('head').append(`<link rel="stylesheet" href="${formsty}" type="text/css" />`);
    
}



//NEWFUNCTION
//Recoge el formulario y lo guarda en chrome.store.local
function saveForm(event,contextVar='assignmentData') {    
    getStoredData(function (data) {
        if (typeof data === 'object' && contextVar in data)         
        { 
            data=data[contextVar];
        } 
        else 
        { 
            data=[]; 
        }
        let studentData = getUserInfo();
        let momento = new Date();
        data.unshift({
            formData: collectForm('form.gradeform'),
            date: momento.toString(),
            student: getUserInfo()
        });
        
        //Eliminamos aquellos elementos del array que no son válidos 
        data=data.filter(function (val,idx,array) { return 'date' in val && 'formData' in val; });

        if (data.length>20) data.pop();
        let fechastr = momento.toLocaleDateString() + " " + momento.toLocaleString().split('GMT')[0];
        let objectToStore={}; 
        objectToStore[contextVar]=data;
        chrome.storage.local.set(objectToStore);
        if (studentData) {
            alert("Datos guardados de " + studentData.name + " a las " + fechastr);
        }
        else {
            alert("Datos guardados a las " + fechastr)
        }
    }, contextVar); 
}

//NEWFUNCTION
//Rescata el formulario de chrome.store.local y lo rellena 
function rescueForm(event, contextVar='assignmentData')
{    
    getStoredData(function (data) {  
        if (typeof data !== 'object' || !(contextVar in data) || data[contextVar].length===0)         
        { 
            alert("No hay datos guardados.");
            return;    
        }         
        
        let dialog=$(dialogHTML);
        for (let i=0;i<data[contextVar].length;i++)
        {
            let assignmentData=data[contextVar][i];
            if (!assignmentData.formData || !assignmentData.date) continue;
            let studentData=assignmentData.student;                    
            let momento=new Date(assignmentData.date);
            let fechastr=momento.toLocaleDateString()+" "+momento.toLocaleString();
            let backupInfo;
            if (studentData)
            {
                backupInfo=studentData.name + " (" + fechastr+")";
            }
            else
            {
                backupInfo="(" + fechastr+")";
            }
            let div=$("<div></div>");
            div.append(backupInfo);
            let btn=$("<button class='ui-button ui-widget ui-corner-all'>Rescatar</button>");
            div.append(btn);
            btn.click(function () {fillForm('form.gradeform', assignmentData.formData);
                                   dialog.dialog( "close" );});
            dialog.append(div);            
        }
        dialog.dialog({
            autoOpen: false,
            height: 400,
            width: 750,
            modal: true,
            buttons: {
              Cancelar: function() {
                dialog.dialog( "close" );
              }
            }
          }).dialog('open');
        return;
    }, contextVar);
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
                                    let lastSelect=null;
                                    for (let input of inputs) {
                                        let sel=$('#' + $(input).attr('data-ref-edudist'));
                                        seleccionarPorValorSelect(sel,nota);
                                        lastSelect=sel;
                                    }
                                    if (lastSelect) lastSelect.change();
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
                                        let sel=$('#' + $(input).attr('data-ref-edudist'));
                                        seleccionarPorValorSelect(sel,nota);                                    
                                        sel.change();
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
                        if (collectCRs()!==-1)
                        {
                            let button3 = $("<button style='margin-left:10px' class='btn btn-primary' id='ED_103OOPRRA133C'>CR -> CE</button>");
                            button3.click(function()
                            {
                                procesarCEsNotaDistribuida();
                            });                            
                            $(fitem).find('.felement').append(button3);
                            
                        }                              
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
            creaSeccionNotaCRsProv();
            creaSeccionNotaCEsProv();
            creaBotonAddFeedback();
            creaSeccionNotaCEPond();

        });
}


/**
 * Si aparece la sección para rellenar la nota por CRs entonces añade una sección para mostrar
 * el cálculo provisional de la nota de los CRs y configura los eventos necesarios para que
 * se actualice.
 */
function creaSeccionNotaCRsProv() {
    let randomId="FPEXTD_nota_CRs_prov"+rID;
    if ($("tr.criterion td.level").length > 0 && $("span#"+randomId).length == 0) 
    {
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

        let calcularNotaProvCR=()=>{
            let notaProvisionalBasadaEnCR=roundGrade(collectCRs(true).gradeBasedOnCRs,2);
            notificar(`Nota provisional basada en criterios de rúbrica: ${notaProvisionalBasadaEnCR}`,1);
            $("span#"+randomId).html(notaProvisionalBasadaEnCR);
        };
        setTimeout(calcularNotaProvCR,500);
        //Lanzamos la actualización de la nota provisional CRs 1 segundo después del mouseup
        $("tr.criterion td.level").mouseup(
            function()
            {
                setTimeout(calcularNotaProvCR,500);
            }
        );

        /*ifAttributeChanged("tr.criterion td.level", "aria-checked", function (a,b,c) {
            console.log(a, a.getAttribute('aria-checked'),b,c);            
            let notaProvisionalBasadaEnCR=roundGrade(collectCRs(true).gradeBasedOnCRs);
            notificar(`Nota provisional basada en criterios de rúbrica: ${notaProvisionalBasadaEnCR}`,1);
            $("span#"+randomId).html(notaProvisionalBasadaEnCR);

        });*/
        $("span#"+randomId).html(roundGrade(collectCRs(true).gradeBasedOnCRs));
    }
}

/**
 * Si aparece la sección para poner las notas de cada CE entonces añade una sección para mostrar
 * el cálculo provisional de la nota de los CEs y configura para que se actualice.
 */
function creaSeccionNotaCEsProv() 
{
    let randomId="FPEXTD_nota_CEs_prov"+rID;
    if ($('[id^=fitem_menuoutcome_].fitem select').length > 0 && $("span#"+randomId).length == 0) 
    {
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

        let calcularNotaProvCE=function () {
            let ceMark=calcCEMark(true);            
            if (ceMark>=0) {
                $("span#"+randomId).html(ceMark);
                notificar("Nota prov. media aritmética CE: "+ceMark,2);
            }
            else 
            {
                $("span#"+randomId).html('[No disponible]');
                notificar("",2);
            }
        }
        $('[id^=fitem_menuoutcome_].fitem select').on('change', calcularNotaProvCE);
        setTimeout(calcularNotaProvCE,500);
    }
}

/**
 * Añade el botón de añadir feedback justo encima de la sección de feedback.
 */
function creaBotonAddFeedback()
{    
            //Botón insertar feedback
            let btnID = 'FPADEX_INSERTAR_FEEDBACK_' + rID;
            //Si no existe lo insertamos
            if (!document.getElementById(btnID)) {

                let b = $('<button class="btn btn-info" style="margin-bottom:10px">Insertar Feedback</button>');
                b.attr('id', btnID);                
                $("div#fitem_id_assignfeedbackcomments_editor label").append(b);
                b.click(renderFeedback);
            }
}

let dialogHTML=`
<div id="dialog-form" title="Selecciona copia de seguridad">
  <div>
    
  </div>
</div>
`;