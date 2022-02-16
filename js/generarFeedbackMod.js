import {collectCRs} from '/js/modules/ext.js';
import {genRandomID} from '/js/modules/u.js';


let randomId='13mdm4iiinfikknakknidkfj4499aDFADFv';

export function renderFeedback () {
    let CRs=collectCRs();        
    if (CRs===-1)
    {
        alert('No se ha encontrado la rúbrica en esta página.');
    }
    else if (CRs===-2)
    {
        alert('No están rellenos todos los criterios de la rúbrica.');
    }
    else
    {
        let id="FPADEX_FEED_"+randomId;
        if (document.getElementById(id))
        {
            if (window.confirm("Ya existe el feedback. ¿Desea eliminarlo y añadir uno nuevo?"))
            {
                $('#'+id).remove();
            }
            else
            {
                return;
            }
        }
        let html = '<TABLE border="1" id="'+id+'">';
        for (let i of CRs) {
            html = html + `
            <TR>
                <TD colspan='3' style='border: 1px solid black; background-color:#eeeeee; font-size:1.3em'>${i.text}</TD>
            </TR>
            <TR>
                <TD style='border: 1px solid black;'>${i.logro}</TD>
                <TD style='border: 1px solid black;'>${i.score} de ${i.scoreMax}</TD>
                <TD style='border: 1px solid black;'>${i.feedback}</TD>
            </TR>
            `;            
        }
        html += '</TABLE>';
        $('#id_assignfeedbackcomments_editoreditable').append(html);      
        $('#id_assignfeedbackcomments_editoreditable').focus();      
    }   
}