/**
 * Este módulo contiene funciones de ayuda para el almacenamiento local.
 */

/**
 * Obtiene la información ya almacenada en chrome.storage.local para el id dado
 */
 export function getStoredData(callback=null, id)
 {
     callback = callback || function (data) {
         console.log(data);
     };
     chrome.storage.local.get(id).then(callback,
         function (error) {             
             console.log(error);            
         }
     );
 }


 /**
  * Función que obtiene un Promise para la información almacenada en 
  * chrome.storage.local o chrome.storage.sync. Modificada de la versión de
  * https://developer.chrome.com/docs/extensions/reference/storage/
  * Luego el promise se puede usar con then para hacer un await y hacerlo sincrono:
  * await getStoredDataPromise().then((data)=> { ... });
  * @param {} id Identificador del elemento almacenado (null si se quiere obtener todo)
  * @param {} sync Si se desea buscar en almacenamiento sincrono o local
  * @returns Promise que será resuelto cuando se rescaten los objetos del almacenamiento.
  */
 export function getStoredDataPromise (id=null, sync=true) {
    // Immediately return a promise and start asynchronous work
    return new Promise((resolve, reject) => {
      // Asynchronously fetch data
      const from=sync ? chrome.storage.sync : chrome.storage.local;
      from.get(id, (items) => {
        // Pass any observed errors down the promise chain.
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        // Pass the data retrieved from storage down the promise chain.
        resolve(items);
      });
    });
}