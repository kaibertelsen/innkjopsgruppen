
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
  }
}