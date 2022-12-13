 /*
 * Funciones accesorias para la carga de ponderación de criterios
 * de evaluación.
 */
 import '/js/jquery-3.6.0.min.js';
 import { genRandomID } from '/js/modules/u.js';
 import { getStoredDataPromise } from '/js/modules/localstoragehelpers.js';
 import { collectCEs } from '/js/modules/ext.js';
 import { getUserInfo } from '/js/modules/u.js';
 
/**
 * Abre la UI para que el usuario introduzca la ponderación de los CEs.
 */
export function openPondCEUI()
{
  getCEPonds().then((datos)=>{  
  console.log("Abriendo interfaz PondCEUI");  
  let pondCeActual='';
  console.log(datos);
  let CEPonds;
  try {
    CEPonds=new Map(JSON.parse(datos[lsPondCeId()]));
  }
  catch (e) 
  {
    CEPonds=new Map();
  }
  
  if (CEPonds instanceof Map) // CE se almacenarán en un mapa
  {
    for (let [key,val] of CEPonds.entries())
    {
      if (pondCeActual.length>0) pondCeActual+="; ";
      pondCeActual+=key+'='+val;
    }
  }  
  textareaPondCE.val(pondCeActual);    
  dialog.dialog('open');  
  });    
}

/**
 * Obtiene las ponderaciones de CEs almacenadas en storage.local.sync.
 * Es un método asincrono (no espera a que los datos se retornen, retorna un Promise)
 * @returns promise datos almacenados como ponderaciones de CEs en un Map
 */
export function getCEPonds()
{  
  return getStoredDataPromise(lsPondCeId());  
} 


/**
*  Guarda la ponderación de los CEs partiendo de su versión en formato texto
*  en un mapa almacenado en chrome.storage.sync.
*  @param string lines texto de las ponderaciones en el formato RA2.a=0.32; RA2.b=0.44
*/
export function setCEPonds (lines=null)
{
  let errors='';
  let datos=new Map();
  
  if (!lines)
    lines=textareaPondCE.val().split(/[^A-Za-z= 0-9.,]+/gi);
  console.log(lines);
  if (lines.length>0)
  {
    for(let line of lines)
    {
      let parts=/(RA|CE)([0-9]+)\.([A-Z]+)\s*=\s*([0-9]+(?:[.,][0-9]+){0,1})/gi.exec(line);
      if (parts && parts.length==5)
      {
        let key=parts[1].toUpperCase();
        key=key==='CE' ? 'RA' : 'RA';
        key+=parts[2];
        key+='.';
        key+=parts[3].toLowerCase();
        let value=parseFloat(parts[4].replace(',','.'));
        datos.set(key,value);
      }
      else
      {
        let error=`No se ha podido procesar el dato de ponderación CEs: ${line}`;
        errors+=error+"\n";
        console.log(error);
      }
    }    
  }

  let objectToStore={}; 
  objectToStore[lsPondCeId()]=JSON.stringify(Array.from(datos.entries()));;
  chrome.storage.sync.set(objectToStore);
  dialog.dialog('close');
}


/**
 * Añade la sección donde aparecerá la nota de los CE ponderados y el botón de calcular la nota ponderada basada en CEs.
 */
 export function creaSeccionNotaCEPond() {  
  if ($("tr.criterion td.level").length > 0 && $("span#"+idSpanConNotaPond).length == 0) 
  {
      section.insertBefore("div#fitem_id_currentgrade");
  }
}

/**
 * Calcula la nota de CE Ponderados y la rellena en el span correspondiente.
 */
function calcularNotaCEPond()
{
    let ponds=getCEPonds();
    let ceNot=collectCEs(true);
    ponds.then( (datos) => {
      let CEPonds;
      try {
        CEPonds=new Map(JSON.parse(datos[lsPondCeId()]));
      }
      catch (e) {
        alert ("ERRCEPOND01: No hay dato almacenados sobre las ponderaciones para esta tarea (se tienen que poner tarea a tarea)");
        return;        
      } 
      if (!ceNot || ceNot.size==0)
      {
            alert ("No se han encontrado las calificaciones por criterios de evaluación.");
            return;
      }
      let sumPonds=0;
      let nota=0;
      let nullcount=0;
      for (let [ceNum, ceData] of ceNot)
      {
        let cetxt="RA"+ceNum;
        if (CEPonds.has(cetxt))
        {
          let pond=CEPonds.get(cetxt);
          sumPonds+=pond;
          nota+=ceData.currGrade!==null?ceData.currGrade*pond:0;
          nullcount+=ceData.currGrade!==null?0:1;
        }
        else
        {
          alert(`El criterio ${cetxt}: \n (${ceData.ce}) \n no tiene una ponderación almacenada.`);
          return;
        }
      }
      nota=nota/sumPonds;
      spanConNotaPond.html(Math.round(nota*100)/100);
      if (nullcount>0) alert(`Se ha calculado la nota, pero hay ${nullcount} notas de criterios de evaluación no rellenas.`);
    } );
    generarTablaCalculoCEPonderado();
}

/**
 * GEnera una tabla del cálculo de la nota según CEs ponderados y la inyecta en el 
 * elemento jquery pasado por parámetro.
 * Nota: si no se puede realizar el cálculo, no se inyecta.
 * @param injectIn elemento jquery donde inyectar
 */
 export function generarTablaCalculoCEPonderado(injectIn)
 {
     let ponds=getCEPonds();
     let ceNot=collectCEs(true);
     ponds.then( (datos) => {
       let CEPonds;
       try {
         CEPonds=new Map(JSON.parse(datos[lsPondCeId()]));
       }
       catch (e) {
         console.log("ERRCEPONDTC01: No hay dato almacenados sobre las ponderaciones para esta tarea (se tienen que poner tarea a tarea)");
         return;        
       } 
       if (!ceNot || ceNot.size==0)
       {
             console.log ("ERRCEPONDTC02: No se han encontrado las calificaciones por criterios de evaluación.");
             return;
       }
       let html=`<table border="1">`;
       html = html + `            
            <TR>
                <TH style='border: 1px solid black; background-color:#eeeeee; font-size:1em'>Criterio de evaluación (CE)</TH>
                <TH style='border: 1px solid black; background-color:#eeeeee; font-size:1em'>Nota obtenida de 0 a 10 en el CE (A)</TH>
                <TH style='border: 1px solid black; background-color:#eeeeee; font-size:1em'>Porcentaje de peso del CE en la unidad</TH>
                <TH style='border: 1px solid black; background-color:#eeeeee; font-size:1em'>Porcentaje de peso del CE en esta tarea (B)</TH>
                <TH style='border: 1px solid black; background-color:#eeeeee; font-size:1em'>Parte proporcional de la nota (C=A*B)</TH>
            </TR>
            `;       
       let sumPonds=0;
       let nota=0;
       let nullcount=0;
       let data=[];
       for (let [ceNum, ceData] of ceNot)
       {
         let cetxt="RA"+ceNum;
         if (CEPonds.has(cetxt))
         {
           let pond=CEPonds.get(cetxt);
           sumPonds+=pond;
           nota+=ceData.currGrade!==null?ceData.currGrade*pond:0;
           nullcount+=ceData.currGrade!==null?0:1;
           data.push({ce:cetxt,nota:ceData.currGrade!==null?ceData.currGrade:0,pu:pond,pt:pond});
         }
         else
         {
           alert(`El criterio ${cetxt}: \n (${ceData.ce}) \n no tiene una ponderación almacenada.`);
           return;
         }
       }

       for (let fi of data)
       {
            fi.pt=fi.pt*10/sumPonds;
            html = html + `            
            <TR>
                <TD style='border: 1px solid black;font-size:0.8em'>${fi.ce}</TD>
                <TD style='border: 1px solid black;font-size:0.8em'>${Math.round(fi.nota*100)/100}</TD>
                <TD style='border: 1px solid black;font-size:0.8em'>${Math.round(fi.pu*100*100)/100}%</TD>
                <TD style='border: 1px solid black;font-size:0.8em'>${Math.round(fi.pt*100)/10}%</TD>
                <TD style='border: 1px solid black;font-size:0.8em'>${Math.round(fi.pt*fi.nota*100/10)/100}</TD>
            </TR>            
            `; 
       }
       
       nota=nota/sumPonds;
       html = html + `            
       <TR>
           <TD colspan='4' style='border: 1px solid black; background-color:#eeeeee; font-size:1em'>Nota tarea según la media ponderada de criterios de evaluación (suma columna C):</TD>
           <TD style='border: 1px solid black;font-size:0.8em'>${Math.round(nota*100)/100}</TD>
       </TR>            
       `;       
       html+='</table>';
       if (injectIn){
        injectIn.append(html);
       }
       //round 
       
     } );
 }


//Id para almacenar los datos en storage.local asociado al ID de tarea
const lsPondCeId=function() { 
        let ui=getUserInfo();
        if (ui && ui.assignmentid) 
        {
          return 'PONDCES_TA'+ui.assignmentid
        }     
        else 
          return 'PONDCES';
      };

//Parte random de cada ID
const rID=genRandomID();
//Id del textarea del dialog
const textareaID=`FPADEXTND_CETA_${rID}`;
//Id del botón del dialog
const submitID=`FPADEXTND_CESUBTN_${rID}`; 
//Código html del dialog
const dialogHTML=`
<div id="dialog-form" title="Carga de CEs">
    <P> Introduce los CEs y su ponderación separados por puntos y comas, tal y como la has puesto en gestiona FP. </P>
    <P> Por ejemplo: RA2.a=0.32; RA2.b=0.44 </P>
    <div>
          <form action="" onSubmit="return false;">
            <textarea id="${textareaID}" style="width: 700px;height: 120px;"></textarea><br>
            <button id="${submitID}">Guardar ponderación de CES</button> 
          </form>
    </div>    
</div>
`;
//Elemento jquery-ui del dialog
const dialog=$(dialogHTML).dialog({
            autoOpen: false,
            height: 400,
            width: 750,
            modal: true,
            buttons: {
              Cancelar: function() {
                dialog.dialog( "close" );
              }
            }
          });
//Elemento jquery del textarea
const textareaPondCE=dialog.find(`#${textareaID}`);
//Elemento jquery del botón, asociamos la acción setCEPonds
const submitPondCE=dialog.find(`#${submitID}`).click(()=>setCEPonds());

//Lugar donde aparecerá la nota ponderada basada en CEs
const idSpanConNotaPond=`FPADEXTND_CESP_${rID}`;

//Id del botón a pulsar para calcular la nota ponderada basada en CEs
const idBotonCalcularNotCEPond=`FPADEXTND_CESB_${rID}`;

//Código de la sección donde aparecerá la nota ponderada:
const sectionHTML=`
        <div class="form-group row  fitem ">
                <div class="col-md-3"><span class="float-sm-right text-nowrap"></span>                
                <span class="col-form-label d-inline-block ">
                    Calificación media PONDERADA de los CE :
                </span>                    
                </div>
                    <div class="col-md-9 form-inline felement" data-fieldtype="static">
                    <div class="form-control-static">
                        <span id="${idSpanConNotaPond}">-</span>
                        <button style='margin-left:10px' class='btn btn-primary' id='${idBotonCalcularNotCEPond}'>Calcular</button>
                    </div>
                    <div class="form-control-feedback invalid-feedback" id="">                        
                    </div>
                </div>
                </div>`;

//Elemento jquery de la sección html                
const section=$(sectionHTML);

//Elemento jquery del span donde aparecerá la nota
const spanConNotaPond=section.find(`#${idSpanConNotaPond}`);

//Elemento jquery del botón donde aparecerá la nota
const botonCalcularNotCEPond=section.find(`#${idBotonCalcularNotCEPond}`).click(()=>calcularNotaCEPond());
