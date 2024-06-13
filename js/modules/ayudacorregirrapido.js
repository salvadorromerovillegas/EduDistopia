import { genRandomID } from '/js/modules/u.js';
import { procesarCEsNotaDistribuida } from '/js/modules/calcularCEsMod.js';
import { Boton } from '/js/modules/ui/creadorBotones.js';

const estiloBoton = "padding: 2px 9px;margin-left: 10px; color:white !important";
const estiloDivBotones="padding: 2px 15px; margin-bottom: -3px; text-align: right;";
const randomDataTag='data-ACR_'+genRandomID();

/**
 * Variable que contendrá el conjunto elementos DOM con el nivel máximo (duplas)
 * {"domElement":..., "textArea":...}
 * Se actualiza desde addBotonMarcarComoCorrecto
 */
let maxLevels=[];
/**
 * Variable que contendrá el conjunto elementos DOM con el nivel máximo (duplas)
 * {"domElement":..., "textArea":...}
 * Se actualiza desde addBotonMarcarComoCorrecto
 */
let minLevels=[];

export function marcarRestanteANoRealizado()
{
    let procesarCEs=true;
    for (let level of minLevels)
    {
        if (level.domElement && level.textArea)
        {
            let result=marcarNivel(level.domElement,level.textArea,'No realizado/No presentado',true,true);
            if (result===-1)
            {
                procesarCEs=false;
                level.textArea.focus();
                alert("No marca nivel porque una retroalimentación de un nivel de rúbrica tiene texto");     
                console.log(level.textArea.value);
                break;
            }
        }
    }
    if (procesarCEs) procesarCEsNotaDistribuida();
}

export function marcarRestanteACompletadoCorrecto()
{
    let procesarCEs=true;
    for (let level of maxLevels)
    {
        if (level.domElement && level.textArea)
        {
            let result=marcarNivel(level.domElement,level.textArea,'Correcto.',true,true);
            if (result===-1)
            {
                procesarCEs=false;
                level.textArea.focus();
                alert("No marca nivel porque una retroalimentación de un nivel de rúbrica tiene texto");
                break;
            }
        }
    }
    if (procesarCEs) procesarCEsNotaDistribuida();
}

/**
 * Marcar un nivel de la rúbrica
 * @param {*} gradingCriteriaLevel Elemento DOM que contiene el nivel a marcar
 * @param {*} textArea Area de texto donde inyectar el texto 
 * @param {*} text Texto a inyectar en el textArea
 * @param {*} silent modo silencioso, no avisa si ya está marcado el nivel indicado
 * @param {*} onlyIfEmpty Marca solo si no hay ya un nivel marcado.
 */
function marcarNivel(gradingCriteriaLevel, textArea, text='', silent=false, onlyIfEmpty=false)
{
    //Comprobamos que no haya un sibbling relleno
    if (onlyIfEmpty && gradingCriteriaLevel.parentNode)
    {
        if ($(gradingCriteriaLevel.parentNode).find('td.checked[role=radio]').length>0) 
        {
            console.log("Ya hay un criterio marcado y se ha indicado onlyIfEmpty=true");
            return false;
        }
    }
    if (onlyIfEmpty && textArea.value.trim().length>0) {
        console.log("No marca nivel porque una retroalimentación de un nivel de rúbrica tiene texto");
        return -1;
    }
    //Comprobamos si ya está marcado el nivel indicado
    let $gcl = $(gradingCriteriaLevel);
    if ($gcl.attr('aria-checked') === 'true') {
       if (!silent) alert('Ya está marcado como no realizado!');
    }
    else {
        //Si no está marcado, lo marcamos y añadimos el texto en el textArea
        $(textArea).append(text);
        $gcl.click();
    }
    return true;
}

function correctoAction(gradingCriteriaLevel, textArea) {
    marcarNivel(gradingCriteriaLevel,textArea,'Correcto.');    
}

function noRealizadoAction(gradingCriteriaLevel, textArea) {
    marcarNivel(gradingCriteriaLevel,textArea,'No realizado.');    
}

/**
 * Añade un botón en cada criterio de rúbrica para poder marcar, rápidamente, el item de rúbrica como correcto y 
 * añadir el texto "Correcto" en el feedback.
 */
export function addBotonMarcarComoCorrecto() {
    //Seleccionamos los criteriaDescriptions que no tengan el atributo data-ACR_...(randomDataTag)
    let criteriaDescriptions = document.querySelectorAll('[id^="advancedgrading-criteria-"][id$="-levels-table"]'+`:not([${randomDataTag}])`);
    for (let cd of criteriaDescriptions) {
        try {
            let [id] = /[0-9]+/g.exec(cd.attributes.id.nodeValue);
            let criteriaLevels = document.querySelectorAll(`td[id^="advancedgrading-criteria-${id}-levels"`);
            let criteriaTextArea = document.querySelector(`[id^="advancedgrading-criteria-${id}-remark"`);
            let notaNLCRMAX = null; //Nota nivel de logro de criterio de rúbrica máximo
            let notaNLCRMIN = null; //Nota nivel de logro de criterio de rúbrica mínimo
            let nlCRMAXdom = null; //Nivel de logro de criterio de rúbrica máximo (objeto DOM)
            let nlCRMINdom= null; //Nivel de logro de criterio de rúbrica mínimo (objeto DOM)
            for (let criteriaLevel of criteriaLevels) {
                let score = criteriaLevel.querySelector('div.score>span');
                score.childNodes[0].nodeValue;
                if (notaNLCRMAX === null || notaNLCRMIN === null) {
                    notaNLCRMIN = notaNLCRMAX = parseFloat(score.childNodes[0].nodeValue);
                    nlCRMINdom = nlCRMAXdom = criteriaLevel;                    
                }
                else {
                    let notaNLCRActual = parseFloat(score.childNodes[0].nodeValue);
                    if (notaNLCRActual > notaNLCRMAX) { notaNLCRMAX = notaNLCRActual; nlCRMAXdom = criteriaLevel; }
                    if (notaNLCRActual < notaNLCRMIN) { notaNLCRMIN = notaNLCRActual; nlCRMINdom = criteriaLevel; }
                }
            }
            //Botón "Correcto"            
            
            let botonCorrecto = new Boton("Correcto");
            botonCorrecto.title=`Otorga la máxima puntuación a este item de rúbrica (${notaNLCRMAX})`;
            botonCorrecto.accion=function (e) {
                correctoAction(nlCRMAXdom, criteriaTextArea);                
            };            
            //Añadimos nlCRMAXdom y criteriaTextArea a la lista de maxLevels
            maxLevels.push({"domElement":nlCRMAXdom,"textArea":criteriaTextArea});

            //Botón "No realizado"
            let botonNoRealizado = new Boton("No realizado");
            botonNoRealizado.title=`Otorga la mínima puntuación a este item de rúbrica (${notaNLCRMIN})`;            
            botonNoRealizado.accion=function (e) {
                noRealizadoAction(nlCRMINdom, criteriaTextArea);                
            };   
                     
            minLevels.push({"domElement":nlCRMINdom,"textArea":criteriaTextArea});
            //Area de "botones"
            let div=$(`<div style="${estiloDivBotones}"></div>`);            
            div.append(botonNoRealizado.boton);
            div.append(botonCorrecto.boton);

            $(cd).parent().append(div);
            //Agregamos el atributo data-ACR_ (randomDataTag) para que no vuelva a escanearse y agregarlo por duplicado.
            $(cd).attr(randomDataTag,id); 
        } catch (error) {
            console.log(error);
        }
    }
    if (criteriaDescriptions.length>0)
    {
        let btn=new Boton("Marcar restantes como no realizados");
        btn.accion=marcarRestanteANoRealizado;
        let div=$(`<span style="${estiloDivBotones}"></span>`);              
        div.append(btn.boton);
        div.insertAfter('label[id="id_advancedgrading_label"]');                
    }
}     