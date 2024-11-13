
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


async function POSTairtableMulti(baseId, tableId, body, id) {
  try {
      let token = await MemberStack.getToken();
      console.log("Token:", token);
      console.log("BaseId:", baseId);
      console.log("TableId:", tableId);
      console.log("Body:", body);

      let response = await fetch(
          `https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&token=${token}`,
          {
              method: "POST",
              body: body,
              headers: {
                  'Content-Type': 'application/json'
              }
          }
      );

      // Les responsen som tekst hvis statusen ikke er "ok"
      if (!response.ok) {
          const errorText = await response.text();
          console.error(`Feilrespons fra API: ${response.status} - ${response.statusText}`);
          console.error("Responsdata:", errorText);
          throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
      } else {
          let data = await response.json();
          console.log("Suksess:", data);
          apireturn({ success: true, data: data, id: id });
      }
  } catch (error) {
      console.error("Feil i POSTairtable:", error);
      apireturn({ success: false, error: error.message, id: id });
  }
}





function multisave(data,baseid,tabelid,returid) {
  // Transformér dataene dynamisk ved å bruke alle nøklene i hvert objekt
  const records = data.map((item) => ({
      fields: { ...item }
  }));

  const batchSize = 10;
  const delay = 300; // Forsinkelse i millisekunder
  let sendpacks = 0;

  // Funksjon for å sende en batch til Airtable
  const sendBatch = async (batch) => {
      const body = { records: batch }; // Airtable forventer en "records"-nøkkel
      console.log("Sender batch til Airtable:", body);
      POSTairtableMulti(baseid, tabelid, JSON.stringify(body), returid);
      sendpacks++;
  };

  // Funksjon for å legge inn forsinkelse
  const delayExecution = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // Funksjon for å prosessere batcher
  const processBatches = async () => {
      for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          await sendBatch(batch);
          if (i + batchSize < records.length) {
              await delayExecution(delay);
          }
      }
  };

  // Start batch-prosesseringen
  processBatches();
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
  }
}