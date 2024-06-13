
/*
 * Service worker que captura los eventos de actualizar tab para
 * añadir los Widgets
 */

/*function injectWebWidgets() {
  const src = chrome.runtime.getURL('/js/injectable.js');
  import(src).then((m) => { 
    m.inject();
    m.injectRAPump();
  });
}*/

function injectUtilidadesNotas() {
  const src = chrome.runtime.getURL('/js/injectableUtilidadesNotas.js');
  import(src).then((m) => {
    m.inject();
  });
}

function injectGuardarFormularios() {
  const src = chrome.runtime.getURL('/js/injectableGuardarFormularios.js');
  import(src).then((m) => {
    m.inject();
  });
}

function injectMejorasCorreo() {
  const src = chrome.runtime.getURL('/js/injectableMejorasCorreo.js');
  import(src).then((m) => {
    m.inject();
  });
}

/**
 * Añade el listener para el evento onUpdated para cualquier tab.
 * Cuando la pestaña tiene la url juntadeandalucia.es intenta inyectar la funcionalidad.
 */
chrome.tabs.onUpdated.addListener((tabId, c, tab) => {
  const islocalfile=/^file:\/\/.*\.(?:html|htm)$/.test(tab.url);
  if (islocalfile || (/^https:\/\/.*\.juntadeandalucia.es\/.*/.test(tab.url))) {
    if (islocalfile || /.*mod\/assign\/view.*/.test(tab.url)) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: injectUtilidadesNotas
      });
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: injectGuardarFormularios
      });
    }
    if (islocalfile || /.*mail\/compose.*/.test(tab.url)) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: injectMejorasCorreo
      });
    }
  }
}
);

