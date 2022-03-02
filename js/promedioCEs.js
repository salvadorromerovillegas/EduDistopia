import { collectCEs, collectCRs } from '/js/modules/ext.js';

export function calcularNotasCEyCR () {

    let msg = [];

    //Recogemos los CEs
    let CEs = collectCEs();

    //Si el mapa contiene elementos
    if (CEs.size > 0) {
        let medGrade = 0;
        let allCEsGraded = true;
        for (const [key, val] of CEs) {
            if (val.currGrade !== null) {
                medGrade = medGrade + val.currGrade;
            }
            else {
                allCEsGraded = false;
                break;
            }
        }
        if (allCEsGraded) {
            medGrade = Math.round(medGrade * 100.0 / CEs.size) / 100.0;
            msg.push(`La nota media obtenida entre todos los CE evaluados es ${medGrade}`);
        }
        else {
            msg.push("No se han rellenado todos los criterios de evaluación.");
        }
    }
    else {
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