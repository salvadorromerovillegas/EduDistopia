
function injectWebWidgets() {
  const src = chrome.runtime.getURL('/js/injectable.js');
  import(src).then((m) => { 
    m.inject();
    m.injectRAPump();
  });
}

chrome.tabs.onUpdated.addListener((tabId,c,tab) => {
  if ( (/^https:\/\/.*\.juntadeandalucia.es\/.*/.test(tab.url)
    && /.*mod\/assign\/view.*/.test(tab.url)) ||
      /^file:\/\/\/.*\/test\.html/.test(tab.url)
    )
  {    
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: injectWebWidgets
    });
  } 
});

