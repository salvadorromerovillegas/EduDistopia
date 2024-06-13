const setStyleButton = document.getElementById("setStyle");
const procesar1Button = document.getElementById("procesar1");
const procesar2Button = document.getElementById("procesar2");
const generarFeedback= document.getElementById("generarFeedback");
const promCEs = document.getElementById("promCEs");
const confPondCE = document.getElementById("confPondCE");
const marcarUsuarios = document.getElementById("marcarUsuarios");
// Cuando se pulsa el botón "setStyle" (Mejorar presentación rúbrica), simplemente se inyecta CSS
setStyleButton.addEventListener("click", async () => {

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true, status: "complete" });

  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ['/css/formstyles.css']
  });

});

//Cuando se pulsa el botón promCS ("Calcular la nota promedio de los CEs")
promCEs.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true, status: "complete" });    

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const src = chrome.runtime.getURL('/js/modules/popupInfoNotaCECR.js');
      import(src).then((m) => { 
        m.mostrarNotasSegunRubricaYCriterios();
      });    
      
      }
    }
  );
  
});


//Cuando se pulsa el botón procesar1 ("Copiar a todos los CEs la nota de la tarea")
procesar1Button.addEventListener("click", async () => {

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true, status: "complete" });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const src = chrome.runtime.getURL('/js/modules/calcularCEsMod.js');
      import(src).then((m) => {         
        m.copiarNotaTareaActualACriteriosEvaluacion();
      });    
      
      }
    }
  );

});

//Cuando se pulsa el botón procesar2 ("Procesar CEs distribute")
procesar2Button.addEventListener("click", async () => {

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true, status: "complete" });    

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const src = chrome.runtime.getURL('/js/modules/calcularCEsMod.js');
      import(src).then((m) => { 
        m.procesarCEsNotaDistribuida();
      });    
      
      }
    }
  );
  
});

generarFeedback.addEventListener("click", async () => {

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true, status: "complete" });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const src = chrome.runtime.getURL('/js/modules/generarFeedbackMod.js');
      import(src).then((m) => {         
        m.renderFeedback();
      });    
      
      }
    }
  );

});

confPondCE.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true, status: "complete" });
  window.close();
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const src = chrome.runtime.getURL('/js/modules/cepond.js');
      import(src).then((m) => {         
        m.openPondCEUI();
      });    
      
      }
    }
  );
}
);


marcarUsuarios.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true, status: "complete" });
  window.close();
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const src = chrome.runtime.getURL('/js/modules/marcarParticipantes.js');
      import(src).then((m) => {         
        m.openPondSFLMarcar();
      });    
      
      }
    }
  );
}
);
