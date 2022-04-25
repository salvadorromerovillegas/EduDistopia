
import '/js/jquery-3.6.0.min.js';
import '/js/jquery-ui/jquery-ui.min.js';

import { whenAvaliable, whenNotAvaliable,ifAttributeChanged } from './modules/dyn.js';
import { collectForm, fillForm, genRandomID, getUserInfo} from '/js/modules/u.js';
import { roundGrade, collectCRs, calcCEMark } from './modules/ext.js';
import { renderFeedback } from '/js/generarFeedbackMod.js';
import { procesarCEsNotaDistribuida } from '/js/calcularCEsMod.js';
import { seleccionarPorValorSelect } from '/js/modules/form.js';

let rID = genRandomID();

/**
 * Inyecta el toolbar para las operaciones de guardar y rescatar
 */
export function inject() {

    let randomId = 'FPADEX_TOOLBAR_'+rID;
    if (!$('div[data-region=grading-navigation-panel] div.container-fluid').attr('data-fpadex-tool')) {
        $('div[data-region=grading-navigation-panel] div.container-fluid').attr('data-fpadex-tool', true);
        $.get(chrome.runtime.getURL('/htmlfragments/toolbar.html'), 
            function (toolbarhtml)
            {
                let toolbar=$(toolbarhtml);
                toolbar.attr('id',randomId);                
                $('div[data-region=grading-navigation-panel] div.container-fluid').append(toolbar);
                console.log("Injected Toolbar");
                toolbar.find('#FPDEX_Save').click(saveForm);
                toolbar.find('#FPDEX_Rescue').click(rescueForm);
                let nh=$('.path-mod-assign [data-region="grade-panel"]').first().position().top+toolbar.height()+3;
                $('.path-mod-assign [data-region="grade-panel"]').css('top',nh+'px');
            }
        );                        
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
//Obtiene la información ya almacenada en la base de datos para el id dado
function getAssignmentData(callback=null, id)
{
    callback = callback || function (data) {
        console.log(data);
    };
    chrome.storage.local.get(id).then(callback,
        function (error) {             
            console.log(error);            
        }
    );
}

//NEWFUNCTION
//Recoge el formulario y lo guarda en chrome.store.local
function saveForm(event,contextVar='assignmentData') {    
    getAssignmentData(function (data) {
        try { 
            data=data[contextVar];
        } 
        catch (e) { 
            data=[]; 
        }
        let studentData = getUserInfo();
        let momento = new Date();
        data.unshift({
            formData: collectForm('form.gradeform'),
            date: momento,
            student: getUserInfo()
        });
        if (data.length>20) data.pop();
        let fechastr = momento.toLocaleDateString() + " " + momento.toLocaleString().split('GMT')[0];
        let objectToStore={}; objectToStore[contextVar]=data;
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
    getAssignmentData(function (data) {     
        let dialog=$(dialogHTML);
        for (let i=0;i<data[contextVar].length;i++)
        {
            let assignmentData=data[contextVar][i];
            let studentData=assignmentData.student;                    
            let momento=new Date((Date)(assignmentData.date));
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
        $(`<div class="form-group row  fitem ">
                <div class="col-md-3"><span class="float-sm-right text-nowrap"></span>                
                <span class="col-form-label d-inline-block ">
                    Calificación calculada del libro de calificaciones (según CRs):
                </span>                    
                </div>
                    <div class="col-md-9 form-inline felement" data-fieldtype="static">
                    <div class="form-control-static">
                        <span id="${randomId}">-</span>
                    </div>
                    <div class="form-control-feedback invalid-feedback" id="">                        
                    </div>
                </div>
                </div>`).insertBefore("div#fitem_id_currentgrade");

        ifAttributeChanged("tr.criterion td.level", "aria-checked", function () {
            $("span#"+randomId).html(roundGrade(collectCRs(true).gradeBasedOnCRs));
        });
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
        $(` <div class="form-group row fitem">
            <div class="col-md-3"><span class="float-sm-right text-nowrap"></span>                
                <span class="col-form-label d-inline-block ">
                    Calificación calculada para criterios de evaluación (según CEs):
                </span>                    
            </div>
            <div class="col-md-9 form-inline felement" data-fieldtype="static">
            <div class="form-control-static">
                <span id="${randomId}">-</span>
            </div>
            <div class="form-control-feedback invalid-feedback" id="">                        
            </div>
        </div>
        </div>`).insertBefore("div#fitem_id_currentgrade");

        $('[id^=fitem_menuoutcome_].fitem select').on('change', function (e) {
            $("span#"+randomId).html(calcCEMark(true));
        });
        
        $("span#"+randomId).html(calcCEMark(true));
    }
}

function creaBotonAddFeedback()
{    
            //Botón insertar feedback
            let btnID = 'FPADEX_INSERTAR_FEEDBACK_' + rID;
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