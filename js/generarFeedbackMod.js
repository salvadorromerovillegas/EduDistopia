import {collectCRs} from '/js/modules/ext.js';
import {generarTablaCalculoCEPonderado} from '/js/modules/cepond.js';
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

        let html = `<div id="${id}"><div id='notamod_${id}'></div><BR><TABLE border="1">`;
        for (let i of CRs) {
            let feedback=toHTMLEntities(i.feedback);
            html = html + `
            <TR>
                <TD colspan='3' style='border: 1px solid black; background-color:#eeeeee; font-size:1em'>${i.text}</TD>
            </TR>
            <TR>
                <TD style='border: 1px solid black; width:40%; font-size:0.8em'>${i.logro}</TD>
                <TD style='border: 1px solid black; width:10%; text-align:center; font-size:0.8em'>${i.score} de ${i.scoreMax}</TD>
                <TD style='border: 1px solid black; width:50%; font-size:0.8em'>${feedback}</TD>
            </TR>
            `;            
        }
        html += '</TABLE></div>';
        
        if (insertarEnFeedback(html))
        {
            console.log(`#${id}#notamod_${id}`);
            generarTablaCalculoCEPonderado($(`#${id} #notamod_${id}`));
        }

    }   
}

function insertarEnFeedback(txt) {

    let editdiv = $('div#fitem_id_assignfeedbackcomments_editor');
    let lnk;
    if (editdiv != null && (lnk = editdiv.find('iframe')).length > 0) {
        let tmp=$(lnk.contents()).find('body#tinymce');
        tmp.append(txt);
        tmp.focus();
        return true;
    }
    else if (editdiv != null && (lnk = editdiv.find('div.editor_atto div#id_assignfeedbackcomments_editoreditable')).length > 0) {
        lnk.append(txt);
        lnk.focus();
        return true;
    }
    else
    {
        let r=confirm('No se ha encontrado un editor de feedback Atto o TinyMCE. ¿Deseas que se copie al portapapeles el feedback (HTML)?');
        if (r)
        {
            let ca=navigator.clipboard.writeText(txt);
            if (ca instanceof Promise)
            {
                ca.then(function () {
                    alert("Feedback copiado al portapapeles en formato HTML.");
                }, function () {
                    alert ("Falló al copiar al portapapeles.");
                });

            }
        }
        return false;
    }

}

function toHTMLEntities(string) {    
    
    let stringMod=string.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
    stringMod=stringMod.replace(/\n/g, '<br>');
    return stringMod;
    
}