
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
       let data = await response.json();
       apireturn (data,id);
}

async function POSTNewRowairtable(baseId,tableId,body,id){
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
        if (!response.ok) {
          throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
          }else {
          let data = await response.json();
          apireturn({success: true, data: data, id: id});
          }
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
        let data = await response.json();
        apireturn (data,id);
}

async function patchAirtable(baseId,tableId,itemId,body,id){
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
    
async function GETairtable(baseId,tableId,itemId,id,status){

        let noCache = "";

        if(status == "no-cache"){
          noCache = "&no-cache=true";
        }
        
        let token = MemberStack.getToken();
        let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&rowId=${itemId}&token=${token}${noCache}`);
       
        if (!response.ok) {
          throw new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`);
        }else {
          let data = await response.json();
        apireturn({success: true, data: data, id: id});
        }
        
}

async function getRecordWithShareKeyButton(shareId,shareKey,id){
  let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?shareId=${shareId}&shareKey=${shareKey}`);
  
      if (!response.ok) {
         if(response.status == 401){
         alert("Linken har utløpt. \nKontakt Kundesenter for å få ny link.")
         }
      }else{
        let data = await response.json();
        apireturn({success: true, data: data, id: id});
      }
}

async function POSTairtablepublicLink(body,id) {
  let token = MemberStack.getToken();
   let response = await fetch(`https://expoapi-zeta.vercel.app/api/share?token=${token}`, {
    method: "POST",
    body: body,
    headers: {
 'Content-Type': 'application/json'
  }
  });
  
  if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
  }else{
    let data = await response.json();
        apireturn({success: true, data: data, id: id});
  }

}


async function sendDataToZapierWebhook(data,url,id) {
    
  const formData = new FormData();
  for (const key in data) {
      const value = data[key];
      // Sjekk om verdien er en array eller objekt og stringify hvis nødvendig
      formData.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value);
  }

  const response = await fetch(url, {
      method: "POST",
      body: formData
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }else{
  let data = await response.json();
    apireturn({success: true, data: data, id: id});
  }
}


function apireturn(response){
  if(response.success){
   ruteresponse(response.data,response.id);
  }else{
      console.log(response);
  }
}