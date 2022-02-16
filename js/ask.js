let setStyleButton = document.getElementById("setStyle");
let procesar1Button = document.getElementById("procesar1");
let procesar2Button = document.getElementById("procesar2");
let generarFeedback= document.getElementById("generarFeedback");
let promCEs = document.getElementById("promCEs");

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
      const src = chrome.runtime.getURL('/js/promedioCEs.js');
      import(src).then((m) => { 
        console.log("Script promedioCEs.js cargado.");      
        m.calcularNotasCEyCR();
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
      const src = chrome.runtime.getURL('/js/calcularCEsMod.js');
      import(src).then((m) => { 
        console.log("Script calcularCEsMod.js cargado. Copiando...");      
        m.procesarCEsCopyNote();
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
      const src = chrome.runtime.getURL('/js/calcularCEsMod.js');
      import(src).then((m) => { 
        console.log("Script calcularCEsMod.js cargado.");      
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
      const src = chrome.runtime.getURL('/js/generarFeedbackMod.js');
      import(src).then((m) => { 
        console.log("Script generarFeedbackMod.js cargado.");      
        m.renderFeedback();
      });    
      
      }
    }
  );

});


