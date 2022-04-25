import { calcCEMark, collectCRs } from '/js/modules/ext.js';

export function calcularNotasCEyCR () {

    let msg = [];

    let notaCEs= calcCEMark();

    if (notaCEs >= 0) {
        msg.push(`La nota media obtenida entre todos los CE evaluados es ${notaCEs}`);
    }
    else if (notaCEs==-1) {
        msg.push("No se han rellenado todos los criterios de evaluación.");
    }
    else if (notaCEs==-2) {
        msg.push("No se han encontrado criterios de evaluación en esta página");
    }
      
    //Recogemos los CRs
    let CRs = collectCRs();
    if (CRs === -2) {
        msg.push('No se han rellenado todos los criterios de rúbrica.');
    }
    else if (CRs === -1) {
        msg.push('No se han encontrado criterios de rúbrica en esta página.');
    }
    else {
        //Calculamos na nota según criterios de rúbrica
        msg.push('La nota media según criterios de rúbrica es ' + Math.round(CRs.gradeBasedOnCRs * 100) / 100);
        
    }

    console.log(msg.join('\n'));
    alert(msg.join('\n'));

};