
import { inyectarEstilo } from '/js/modules/ui/inyectarEstilos.js';
import '/js/jquery-3.6.0.min.js';
import '/js/jquery-ui/jquery-ui.min.js';


export function inject() {

    //Inyectar css en la respuesta de emails        
    if ($('section#region-main .mail_reply').length>0) {
        inyectarEstilo('/css/mailstyles.css');
    }     
    
}


