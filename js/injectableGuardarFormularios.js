
import '/js/jquery-3.6.0.min.js';
import '/js/jquery-ui/jquery-ui.min.js';

import { collectForm, fillForm, genRandomID, getUserInfo} from '/js/modules/u.js';
import { getStoredData } from '/js/modules/localstoragehelpers.js';
import { appendToolbarTo, toolbarHeight, setSaveFormButtonHandler, setRescueFormButtonHandler } from '/js/modules/toolbar.js';
import { inyectarEstilo } from '/js/modules/ui/inyectarEstilos.js';

const rID = genRandomID();

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
        let nh=118;
        try {
            let nh=$('.path-mod-assign [data-region="grade-panel"]').first().position().top+toolbarHeight();                
        } 
        catch (ex) {
            console.log(ex);
        }
        $('.path-mod-assign [data-region="grade-panel"]').css('top',nh+'px');
        //Establecemos el manejador del botón guardar formularios
        setSaveFormButtonHandler(saveForm);
        //Establecemos el manejador del botón guardar formularios
        setRescueFormButtonHandler(rescueForm);
        //Marcamos el div donde hemos insertado el toolbar para que no se vuelva a insertar el toolbar
        $('div[data-region=grading-navigation-panel] div.container-fluid').attr('data-fpadex-tool', true);                              
    }
       
    //Estilo JQuery UI
    inyectarEstilo('/js/jquery-ui/jquery-ui.min.css');
}

/** Recoge el formulario y lo guarda en chrome.store.local */
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

/** 
 * Rescata el formulario de chrome.store.local y lo rellena 
 */
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

let dialogHTML=`
<div id="dialog-form" title="Selecciona copia de seguridad">
  <div>
    
  </div>
</div>
`;