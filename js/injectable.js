
import {whenAvaliable, collectForm, fillForm, genRandomID} from '/js/modules/u.js';
import '/js/jquery-3.6.0.min.js';
import {renderFeedback} from '/js/generarFeedbackMod.js';

let rID=genRandomID();

export function inject() {
        
        let randomId = 'FPADEX_ie93odo312933_123kfiikaDKFNA_222';
        if ($('#' + randomId).length == 0) {
            $('body').append("<div id='" + randomId + "'></div>");
            $('#' + randomId).load(chrome.runtime.getURL('/htmlfragments/toolbar.html'));
            console.log("Injected Toolbar");
            $(document).on('click', '#' + randomId + ' #FPDEX_Save',
                function (e) {
                    let data = collectForm('form.gradeform');
                    chrome.storage.local.set({ assignmentData: data });
                }
            );
            $(document).on('click', '#' + randomId + ' #FPDEX_Rescue', function (e) {
                chrome.storage.local.get('assignmentData').then(
                    function (data) { fillForm('form.gradeform', data.assignmentData); },
                    function (error) { alert('No se pudo recuperar') }
                );
            });      
        }

        //Insertamos cuando esté disponible los botones extra y el estilo
        whenAvaliable('form[data-region=grading-actions-form]').then(
            (elm)=>{

                //Estilo
                let formsty = chrome.runtime.getURL('/css/formstyles.css');
                $('head').append(`<link rel="stylesheet" href="${formsty}" type="text/css" />`); 

                //Botón insertar feedback
                let btnID='FPADEX_INSERTAR_FEEDBACK_'+rID;      
                if (!document.getElementById(btnID))
                {

                    let b=$('<button class="btn btn-info" style="font-size:9px">Insertar<br>Feedback</button>');
                    b.attr('id',btnID);
                    $(elm).append(b);                    
                    b.click(renderFeedback);
                }

            }
        );
}