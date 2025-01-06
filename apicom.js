
function createAirtableANDFormula(obj) {
    const conditions = Object.keys(obj).map(key => {
      const value = typeof obj[key] === 'string' ? `'${obj[key]}'` : obj[key];
      return `{${key}} = ${value}`;
    });
    return `AND(${conditions.join(', ')})`;
}

function airtablebodylistAND(obj){
    //Føringer etter dato
    let formula = createAirtableANDFormula(obj);
      let body = JSON.stringify({
              "formula":formula ,
              "pageSize": 50,
              "offset": 0
            });
      return body;
}

function rawdatacleaner(data){
    var array = [];
        for (var i = 0;i<data.data.length;i++){
          array.push(data.data[i].fields);
        }
    return array;
}
//
async function Getlistairtable(baseId,tableId,body,id){
    let token = MemberStack.getToken();
    let response = await fetch(`https://expoapi-zeta.vercel.app/api/search?baseId=${baseId}&tableId=${tableId}&token=${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body
    });

    if (!response.ok) {
    throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
    }else {
    let data = await response.json();
    apireturn({success: true, data: data, id: id});
    }

}

async function POSTairtable(baseId,tableId,body,id){
    let token = MemberStack.getToken();
    let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&token=${token}`, {
       method: "POST",
       body:body,
       headers: {
       'Content-Type': 'application/json'
        }
       });
       if (!response.ok) {
        throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
        }else {
        let data = await response.json();
        apireturn({success: true, data: data, id: id});
        }
}
    
async function DELETEairtable(baseId,tableId,itemId,id){
    let token = MemberStack.getToken();
    
    let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&rowId=${itemId}&token=${token}`, {
          method: "DELETE"
        });
        let data = await response.json();
        apireturn (data,id);
}

async function PATCHairtable(baseId,tableId,itemId,body,id){
    // fra memberstack
    let token = MemberStack.getToken();
    let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&rowId=${itemId}&token=${token}`, {
          method: "PATCH",
          body:body,
            headers: {
             'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
          throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
          }else {
          let data = await response.json();
          apireturn({success: true, data: data, id: id});
          }
}
    
async function GETairtable(baseId,tableId,itemId,id){
        
        let token = MemberStack.getToken();
        let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&rowId=${itemId}&token=${token}`);
        
        if (!response.ok) {
          throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
          }else {
          let data = await response.json();
          apireturn({success: true, data: data, id: id});
          }
        
}
    
//webflow

 async function PATCHwebflow(collectionId,itemId,body,id){
  let token = MemberStack.getToken();
  
  let response = await fetch(`https://webflow-woad.vercel.app/api/item?collectionId=${collectionId}&itemId=${itemId}&token=${token}`, {
    method: "PATCH",
    body: body,
    headers: {
      'Content-Type': 'application/json'
      }
  });

  if (!response.ok) {
    throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
    }else {
    let data = await response.json();
    apireturn({success: true, data: data, id: id});
    }

}

// Example: Create webflow collection item
async function POSTwebflow(collectionId,body,id){
  let token = MemberStack.getToken();
  let response = await fetch(`https://webflow-woad.vercel.app/api/item?collectionId=${collectionId}&token=${token}`, {
    method: "POST",
    body: body,
    headers: {
      'Content-Type': 'application/json'
      }
  });

  if (!response.ok) {
    throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
    }else {
    let data = await response.json();
    apireturn({success: true, data: data, id: id});
    }

}

/*
async function POSTairtableMulti(baseId, tableId, body, id) {
  try {
      const token = await MemberStack.getToken();
      console.log("Token mottatt:", token);
      console.log("BaseId:", baseId);
      console.log("TableId:", tableId);
      console.log("Body før behandling:", body);

      // Bestem request body basert på antall oppføringer
      let requestBody;

      if (body.length > 1) {
          // Flere oppføringer - opprett en ny array med "fields"-nøkkelen for hver oppføring
          requestBody = body.map(item => ({
              fields: { ...item }
          }));
      } else if (body.length === 1) {
          // Én oppføring - send objektet direkte med "fields"-nøkkelen
          requestBody = body[0];
      } else {
          // Ingen oppføringer - logg en advarsel og returner
          console.warn("Ingen oppføringer å sende.");
          return;
      }

      console.log("Request Body som skal sendes:", requestBody);

      // Send POST-forespørsel
      const response = await fetch(
          `https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&token=${token}`,
          {
              method: "POST",
              body: JSON.stringify(requestBody),
              headers: {
                  'Content-Type': 'application/json'
              }
          }
      );

      if (!response.ok) {
          const errorText = await response.text();
          console.error(`Feilrespons fra API: ${response.status} - ${response.statusText}`);
          console.error("Responsdata fra API:", errorText);
          throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
      } else {
          const data = await response.json();
          console.log("Data lagret med suksess:", data);
          apireturn({ success: true, data: data, id: id });
      }
  } catch (error) {
      console.error("Feil i POSTairtableMulti:", error);
      apireturn({ success: false, error: error.message, id: id });
  }
}

async function multisave(data, baseid, tabelid, returid) {
  const batchSize = 10;
  const delay = 300; // Forsinkelse i millisekunder
  let sendpacks = 0;

  // Funksjon for å sende en batch til Airtable
  const sendBatch = async (batch) => {
      try {
          console.log("Sender batch:", batch);
          await POSTairtableMulti(baseid, tabelid, batch, returid);
          sendpacks++;
          console.log(`Batch ${sendpacks} sendt.`);
      } catch (error) {
          console.error("Feil ved sending av batch:", error);
      }
  };

  // Funksjon for å legge inn forsinkelse
  const delayExecution = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // Funksjon for å prosessere batcher
  const processBatches = async () => {
      for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          await sendBatch(batch);
          if (i + batchSize < data.length) {
              await delayExecution(delay);
          }
      }
      console.log("Alle batcher er ferdig prosessert.");
  };

  // Start batch-prosesseringen og returner en Promise
  return processBatches();
}
*/

async function POSTairtableMulti(baseId, tableId, body) {
  return new Promise(async (resolve, reject) => {
      try {
          const token = await MemberStack.getToken();
          console.log("Token mottatt:", token);

          let requestBody = body.map(item => ({ fields: { ...item } }));

          console.log("Request Body som skal sendes:", requestBody);

          const response = await fetch(
              `https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&token=${token}`,
              {
                  method: "POST",
                  body: JSON.stringify(requestBody),
                  headers: {
                      'Content-Type': 'application/json'
                  }
              }
          );

          if (!response.ok) {
              const errorText = await response.text();
              console.error(`Feilrespons fra API: ${response.status} - ${response.statusText}`);
              console.error("Responsdata fra API:", errorText);
              reject(new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`));
          } else {
              const data = await response.json();
              console.log("Batch lagret med suksess:", data);
              resolve(data); // Returner responsdata for denne batchen
          }
      } catch (error) {
          console.error("Feil i POSTairtableMulti:", error);
          reject(error);
      }
  });
}

async function multisave(data, baseid, tabelid, returid) {
  const batchSize = 10;
  let sendpacks = 0;
  const totalBatches = Math.ceil(data.length / batchSize); // Beregn totalt antall batcher
  const allResponses = []; // Array for å samle alle responsdata

  // Funksjon for å sende en batch til Airtable
  const sendBatch = async (batch) => {
      try {
          console.log("Sender batch:", batch);
          const response = await POSTairtableMulti(baseid, tabelid, batch);
          sendpacks++;
          console.log(`Batch ${sendpacks} sendt.`);
          allResponses.push(response); // Legg til responsen for denne batchen

          // Oppdater tekst-elementet med fremdrift
          const progress = Math.floor((sendpacks / totalBatches) * 100);
          updateProgressText(progress);
      } catch (error) {
          console.error("Feil ved sending av batch:", error);
          throw error; // Stop prosesseringen hvis en batch feiler
      }
  };

  // Funksjon for å oppdatere tekst-elementet
  const updateProgressText = (progress) => {
      const progressElement = document.getElementById("progress-text"); // Sett inn ID-en til tekst-elementet
      if (progressElement) {
          progressElement.textContent = `Fremdrift: ${progress}%`;
      }
  };

  // Prosessering av batcher
  const processBatches = async () => {
      for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize); // Hent batch
          await sendBatch(batch); // Vent på at batch blir sendt og bekreftet
      }
      console.log("Alle batcher er ferdig prosessert.");
  };

  // Start batch-prosesseringen
  try {
      await processBatches();
      console.log("Samlede responsdata:", allResponses);
      apireturn({ success: true, data: allResponses, id: returid });
  } catch (error) {
      console.error("Prosesseringen ble stoppet på grunn av en feil:", error);
      apireturn({ success: false, error: error.message, id: returid });
  }
}


function convertMultiResponseData(data) {
  return data.flatMap(samling => samling.map(item => item.fields));
}





//ruting
function apireturn(response){
    if(response.success){
     ruteresponse(response.data,response.id);
    }else{
        console.log(response);
    }
}



function ruteresponse(data,id){
  if(id == "responsgroup"){
      responsgroup(data);
  }else if(id == "companycheck"){
      companycheck(data);
  }else if(id == "responscreatecompany"){
      responscreatecompany(data);
  }else if(id == "responsecompany"){
    responsecompany(data);
  }else if(id == "responseslug"){
    responseslug(data);
  }else if(id == "responsecheckUserEmail"){
    responsecheckUserEmail(data);
  }else if(id == "getConnectionsresponse"){
    getConnectionsresponse(data);
  }else if(id == "retursaveConnections"){
    retursaveConnections(data);
  }else if (id == "responseupdatefollowingUpstatus"){
    responseupdatefollowingUpstatus(data);
  }else if (id == "respondUserData"){
    respondUserData(data);
  }else if (id == "onboardedregistredresponse"){
    onboardedregistredresponse(data);
  }else if(id=="respondsupplierlist"){
    respondsupplierlist(data,id); 
  }else if(id=="respondpresetlist"){
    respondpresetlist(data,id);
  }else if(id=="respondcolumlist"){
    respondcolumlist(data,id);
  }else if(id=="postpresetrespond"){
    postpresetrespond(data,id);
  }else if(id=="respondcompanylist"){
    respondcompanylist(data,id);
  }else if(id=="respondBuffer"){
    respondBuffer(data,id);
  }else if(id=="returnsaveimport"){
    returnsaveimport(data,id);
  }else if(id=="returnsavevalue"){
    returnsavevalue(data,id);
  }else if(id=="respondfilenamecontroll"){
    respondfilenamecontroll(data,id);
  }else if(id=="returNewMultiImport"){
    returNewMultiImport(data);
  }
  

}
